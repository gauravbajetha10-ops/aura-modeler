'use server'

import fs from 'fs';
import path from 'path';

export async function getMediaFiles() {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Get Models
  const modelsDir = path.join(publicDir, 'models');
  let models: {name: string, url: string}[] = [];
  if (fs.existsSync(modelsDir)) {
    models = fs.readdirSync(modelsDir)
      .filter(file => file.endsWith('.glb'))
      .map(file => {
        // Format name: remove extension, replace _ and - with space, title case
        const name = file.replace('.glb', '')
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        return {
          name,
          url: `/models/${file}`
        };
      });
  }

  // Get Music
  const musicDir = path.join(publicDir, 'music');
  let musicTracks: {name: string, url: string}[] = [];
  if (fs.existsSync(musicDir)) {
    musicTracks = fs.readdirSync(musicDir)
      .filter(file => file.endsWith('.mp3'))
      .map(file => {
        // Format name: remove extension, replace bensound- (if exists), replace _ and - with space, title case
        let name = file.replace('.mp3', '');
        name = name.replace(/^bensound-/, '');
        name = name.replace(/[_-]/g, ' ');
        name = name.replace(/\b\w/g, c => c.toUpperCase());
        return {
          name,
          url: `/music/${file}`
        };
      });
  }

  return { models, musicTracks };
}
