import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './config';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { PauseScene } from './scenes/PauseScene';
import './style.css';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'juego',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#91ddff',
  antialias: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 90 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 320, height: 180 },
    max: { width: 1440, height: 810 }
  },
  scene: [MenuScene, GameScene, PauseScene, GameOverScene]
});

game.events.once(Phaser.Core.Events.READY, () => {
  const canvas = game.canvas;
  canvas.setAttribute('aria-label', 'Atrapa las Estrellas, videojuego de plataformas');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('tabindex', '0');
  canvas.focus();
});
