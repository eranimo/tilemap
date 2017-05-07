// @flow


/*

Component:
  - a class that encapsulates a behavior
Entity:
  - a container of components
  - has a state object
EntityManager:
  - creates entities from objects with attached components
System:
  - a function that gets entities with certain components and does something with them

*/

let currentID = 0;

export class Component {
  id: number;
  entity: Entity;
  state: Object;

  constructor(entity: Entity, state: Object) {
    this.entity = entity;
    this.state = state;
    this.id = currentID;
    currentID++;
  }

  init() {}
  update() {}

  on(event: GameEvent) {} // eslint-disable-line
}

export class Entity {
  name: ?string;
  manager: EntityManager;
  components: Map<string, $Subtype<Component>>;

  constructor(name: ?string) {
    this.name = name;
    this.components = new Map();
  }

  addComponent(identifier: string, instance: $Subtype<Component>) {
    this.components.set(identifier, instance);
  }

  getComponent(identifier: string): ?$Subtype<Component> {
    return this.components.get(identifier);
  }

  export(): Object {
    const data = {};
    for (const [identifier, instance]: [string, Component] of this.components.entries()) {
      data[identifier] = instance.state;
    }
    return data;
  }
}

export type GameEvent = {
  name: string,
  value: Object,
};

export class System {
  manager: EntityManager;
  static componentTypes: Array<Class<$Subtype<Component>>> = [];

  constructor(manager: EntityManager) {
    this.manager = manager;

    console.log(
      `Registered system ${this.constructor.name} with ${this.constructor.componentTypes.length} components\n`,
      this.constructor.componentTypes.map((c: Class<$Subtype<Component>>): string => {
        return `\t- ${c.name}`;
      }).join('\n')
    );
  }

  // gets the components this system cares about
  getComponents(): Array<$Subtype<Component>> {
    let foundComponents: Array<$Subtype<Component>> = [];
    for (const type: Class<$Subtype<Component>> of this.constructor.componentTypes) {
      for (const comp: $Subtype<Component> of this.manager.componentInstances) {
        if (comp instanceof type) {
          foundComponents.push(comp);
        }
      }
    }
    return foundComponents;
  }

  update() {}
}

export default class EntityManager {
  entities: Array<Entity>;
  componentTypes: Map<string, Class<Component>>;
  componentInstances: Array<$Subtype<Component>>;

  constructor() {
    this.componentTypes = new Map();
    this.componentInstances = [];
    this.entities = [];
  }

  addEntity(components: { [string]: Object }, name: ?string): Entity {
    const entity: Entity = new Entity(name);
    for (const [identifier, state]: [string, any] of Object.entries(components)) {
      const _class: ?Class<Component> = this.componentTypes.get(identifier);
      if (_class) {
        const component: Component = new _class(entity, state);
        this.componentInstances.push(component);
        entity.addComponent(identifier, component);
      }
    }
    for (const [identifier, instance]: [string, Component] of entity.components.entries()) {
      instance.init();
    }
    entity.manager = this;
    this.entities.push(entity);
    return entity;
  }

  registerComponent(name: string, component: Class<Component>) {
    this.componentTypes.set(name, component);
  }

  registerComponents(list: Array<Array<any>>) {
    for (const [name, component] of list) {
      this.registerComponent(name, component);
    }
  }

  getComponents(identifier: string): Array<Component> {
    const components: Array<Component> = [];
    for (const entity of this.entities) {
      const comp: ?Component = entity.getComponent(identifier);
      if (comp) {
        components.push(comp);
      }
    }
    return components;
  }

  // update all entities
  update() {
    for (const entity of this.entities) {
      for (const [identifier, instance]: [string, Component] of entity.components.entries()) {
        instance.update();
      }
    }
  }
}
