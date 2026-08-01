import { GameController } from './game/controller';

try {
  const controller = new GameController();
  controller.start();
} catch (error) {
  const root = document.querySelector<HTMLElement>('#game-root');
  if (root) {
    root.replaceChildren();
    const card = document.createElement('section');
    card.className = 'title-card';
    const heading = document.createElement('h1');
    heading.textContent = 'THE CROWD GOT CONFUSED';
    const message = document.createElement('p');
    message.textContent = 'Please reload the game. Technical details are available in the console.';
    card.append(heading, message);
    root.append(card);
  }
  console.error(error);
}
