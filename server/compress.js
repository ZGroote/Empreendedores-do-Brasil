// Compressão real de mídia via ffmpeg (instalado no PATH ou apontado por FFMPEG_PATH).
// Vídeos -> MP4 H.264 até 720p; imagens -> WebP até 1920px. Outros formatos ficam como estão.
// Se o ffmpeg faltar ou falhar, o arquivo original é mantido (o upload nunca se perde).
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg';
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp'];

function ffmpegArgs(input, output, ext) {
  if (VIDEO_EXTS.includes(ext)) {
    return ['-i', input,
      '-vf', "scale='min(1280,iw)':-2", // limita a 720p/1280px de largura, mantém proporção
      '-c:v', 'libx264', '-crf', '28', '-preset', 'medium',
      '-c:a', 'aac', '-b:a', '96k',
      '-movflags', '+faststart', // começa a tocar antes de baixar tudo
      '-y', output];
  }
  return ['-i', input, '-vf', "scale='min(1920,iw)':-2", '-c:v', 'libwebp', '-quality', '75', '-y', output];
}

// Retorna { filePath, size } do arquivo final (comprimido ou o original, o que for menor)
function compressMedia(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;
  const keepOriginal = { filePath, size: originalSize };

  if (!VIDEO_EXTS.includes(ext) && !IMAGE_EXTS.includes(ext)) {
    return Promise.resolve(keepOriginal);
  }

  const output = filePath.slice(0, -ext.length) + (VIDEO_EXTS.includes(ext) ? '.min.mp4' : '.min.webp');

  return new Promise((resolve) => {
    execFile(FFMPEG, ffmpegArgs(filePath, output, ext), { windowsHide: true }, (err) => {
      if (err || !fs.existsSync(output)) {
        console.error('Compressão falhou, mantendo original:', err ? err.message.split('\n')[0] : 'sem saída');
        fs.rmSync(output, { force: true });
        return resolve(keepOriginal);
      }
      const size = fs.statSync(output).size;
      if (size >= originalSize) {
        fs.rmSync(output, { force: true });
        return resolve(keepOriginal);
      }
      fs.rmSync(filePath, { force: true });
      resolve({ filePath: output, size });
    });
  });
}

module.exports = { compressMedia, VIDEO_EXTS };
