import './style/style.scss';
import { GameLeader } from './game/game-leader';
import { Playground } from './visual/playground';

const gameleader = new GameLeader();
new Playground(gameleader.getPlayers());

