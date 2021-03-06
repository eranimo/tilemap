// @flow
import {
  SCENE_CELLS_WIDTH,
  SCENE_CELLS_HEIGHT,
  SCENE_WIDTH,
  SCENE_HEIGHT,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  CELL_SIZE
} from './constants';
import EntityManager from './engine/entityManager';
import Point from './geometry/point';

import ViewportSystem from './systems/viewport';
import RegionSystem from './systems/region';
import DisplaySystem from './systems/display';
import MinimapUISystem from './systems/minimapUI';
import MouseEventSystem from './systems/mouseEvent';
import UISystem from './systems/ui';
import GridSystem from './systems/grid';
import TimeSystem from './systems/time';
import SelectionSystem from './systems/selection';
import KeyboardSystem from './systems/keyboard';
import MovementSystem from './systems/movement';
import Building from './entities/building';
import Person from './entities/person';
import initUI from './ui';
import Stats from 'stats.js';


export default class World {
  canvas: HTMLElement;
  ctx: CanvasRenderingContext2D;
  manager: EntityManager;
  uiState: Object;
  stats: Stats;

  constructor({ main, resources }: { main: HTMLElement, resources: Object }) {
    this.manager = new EntityManager({
      viewport: new ViewportSystem({
        width: SCENE_WIDTH,
        height: SCENE_HEIGHT
      }, {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      }, main),
      region: new RegionSystem(),
      time: new TimeSystem(),
      display: new DisplaySystem(),
      mouseEvents: new MouseEventSystem(),
      minimap: new MinimapUISystem(),
      ui: new UISystem(),
      grid: new GridSystem(),
      selection: new SelectionSystem(),
      keyboard: new KeyboardSystem(),
      movement: new MovementSystem(),
    }, resources);
    window.canvas = main;

    window.systems = this.manager.systems;

    this.manager.addEntity(Building, {
      position: new Point(10, 10)
    });

    for (let x = 0; x < SCENE_CELLS_WIDTH; x++) {
      for (let y = 0; y < SCENE_CELLS_HEIGHT; y++) {
        this.manager.addEntity(Building, {
          position: new Point(x, y),
        });
      }
    }

    this.manager.addEntity(Person, {
      position: new Point(16, 15),
      name: 'person_0',
    });

    const person = this.manager.addEntity(Person, {
      position: new Point(11, 10),
      name: 'person_1',
    });
    const walk = person.getComponents('Walk');
    walk[0].goTo(Point.random(100, 100).multiply(CELL_SIZE));
    this.manager.refresh();
    window.manager = this.manager;

    this.stats = new Stats();
    // $FlowFixMe
    document.body.appendChild(this.stats.dom);
    this.stats.showPanel(0);
  }

  draw(timeSinceLastUpdate: number) {
    for (const system: any of Object.values(this.manager.systems)) {
      system.draw(timeSinceLastUpdate);
    }
  }

  update() {
    // this.manager.update();
    for (const system: any of Object.values(this.manager.systems)) {
      system.update();
    }
    initUI(this.manager);
  }

  loop() {
    const timeSystem = this.manager.systems.time;
    const VIDEO_FPS = 60;
    const refreshDelay = 1000 / VIDEO_FPS;
    let timeOfLastExecution;
    let timeSinceLastUpdate = 0;
    const execute = () => {
      this.stats.begin();
      const now = Date.now();

      // time since last execution
      const dt = now - (timeOfLastExecution || now);

      // set timeOfLastExecution as now
      timeOfLastExecution = now;

      // if we don't update the UI now, increase timeSinceLastUpdate by dt
      timeSinceLastUpdate += dt;

      if (timeSinceLastUpdate >= refreshDelay) {
        this.update();

        timeSystem.time = timeSystem.time + (timeSinceLastUpdate * timeSystem.speed);
      }
      this.draw(timeSinceLastUpdate);
      timeSinceLastUpdate = 0;
      this.stats.end();
      requestAnimationFrame(execute);
    };

    requestAnimationFrame(execute);
  }
}
