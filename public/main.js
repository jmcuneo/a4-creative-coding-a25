// import our three.js reference
import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { Pane } from "https://unpkg.com/tweakpane";

// Agent class
class Agent {
    constructor(type, scene, params) {
        // type = "prey" or "predator"
        this.type = type;
        this.scene = scene;
        this.reproductionTimer = 0;
        // use initial energy for predators
        this.energy = type === "predator" ? params.predatorInitialEnergy : 0;
        // speed
        this.speed = type === "predator" ? params.predatorSpeed : params.preySpeed;
        // set random position
        this.position = new THREE.Vector3(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            0
        );

        // make prey geometry smaller spheres than predator
        const geometry = new THREE.SphereGeometry(
            type === "prey" ? 0.8 : 1.5,
            12,
            12
        );
        const material = new THREE.MeshPhongMaterial({
            color: type === "prey" ? 0x00ff00 : 0xff0000,
            shininess: 2000,
        });

        // mesh class is geometry + material (like the final object)
        this.mesh = new THREE.Mesh(geometry, material);
        // give the mesh the random position
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }

    // one time unit in the simulation
    update(params, agents, delta) {
        // prey
        if (this.type === "prey") {
            this.flee(params, agents, delta);

            // increment the timer
            this.reproductionTimer += delta;

            // if timer reaches reproductive rate time, add new prey to scene
            if (this.reproductionTimer > params.reproductionRate) {
                agents.push(new Agent("prey", this.scene, params));
                this.reproductionTimer = 0;
            }
        } else {
            // predators find the nearest prey
            this.chasePrey(agents, params, delta);
            this.energy -= delta;
            // if energy reaches 0, remove from scene
            if (this.energy <= 0) this.die(agents);
        }

        this.mesh.position.copy(this.position);
    }

    flee(params, agents, delta) {
        // initialize random direction if not already set
        if (!this.direction) {
            this.direction = new THREE.Vector3(
                Math.random() - 0.5,
                Math.random() - 0.5,
                0
            ).normalize();
        }

        // flee from predators
        const predators = agents.filter((a) => a.type === "predator");
        let fleeVector = new THREE.Vector3(0, 0, 0);
        const fleeRadius = 10;

        predators.forEach((pred) => {
            const predDist = this.position.distanceTo(pred.position);
            if (predDist < fleeRadius) {
                const away = new THREE.Vector3()
                    .subVectors(this.position, pred.position) // sets a vector  in the dircetion from predator to the prey (the direction we want to move in)
                    .normalize() // just the direction
                fleeVector.add(away);
            }
        });

        this.direction.add(fleeVector);
        this.direction.normalize();

        // move at constant speed according to direction
        this.position.addScaledVector(this.direction, params.preySpeed * delta);

        // bounce off edges
        const bounds = 40;
        if (this.position.x > bounds) {
            this.position.x = bounds;
            this.direction.x *= -1;
        }
        if (this.position.x < -bounds) {
            this.position.x = -bounds;
            this.direction.x *= -1;
        }
        if (this.position.y > bounds) {
            this.position.y = bounds;
            this.direction.y *= -1;
        }
        if (this.position.y < -bounds) {
            this.position.y = -bounds;
            this.direction.y *= -1;
        }

        // occasionally randomize direction slightly
        if (Math.random() < 0.03) {
            this.direction.x += (Math.random() - 0.5);
            this.direction.y += (Math.random() - 0.5);
            this.direction.normalize();
        }
    }

    chasePrey(agents, params, delta) {
        // find nearest prey (smallest distance between itself and prey)
        // get the prey list
        const preyList = agents.filter((agent) => agent.type === "prey");
        if (preyList.length === 0) return;

        // find min distance between each object in PreyList and this object
        let nearest = preyList[0];
        let minDist = this.position.distanceTo(nearest.position);
        // for each object in preyList
        for (let i = 1; i < preyList.length; i++) {
            // find distance to it
            const dist = this.position.distanceTo(preyList[i].position);
            if (dist < minDist) {
                nearest = preyList[i];
                minDist = dist;
            }
        }

        // move towards nearest prey
        const direction = new THREE.Vector3()
            .subVectors(nearest.position, this.position)
            .normalize();
        this.position.addScaledVector(direction, params.predatorSpeed * delta);

        // if it catches the prey, prey dies, predator's energy refills
        if (this.position.distanceTo(nearest.position) < 1.5) {
            nearest.die(agents);
            this.energy = params.predatorInitialEnergy;
        }
    }

    die(agents) {
        this.scene.remove(this.mesh);
        const index = agents.indexOf(this);
        if (index > -1) agents.splice(index, 1);
    }
}

const app = {
    init() {
        // Starting object. Will be populated with camera, lighting objects, etc.
        this.scene = new THREE.Scene();

        // Create a new camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        this.camera.position.z = 100;

        // Specify the type of renderer to use. In this case, it's a WebGL renderer.
        this.renderer = new THREE.WebGLRenderer();

        // Fill the entire window
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Creates the canvas element and appends it to our page
        document.body.appendChild(this.renderer.domElement);

        this.createLights();

        // agents array holds all living objects in sim
        this.agents = [];
        this.params = {
            preyCount: 30,
            predatorCount: 3,
            preySpeed: 20, // percentage
            predatorSpeed: 30, // percentage
            reproductionRate: 5, // in seconds
            predatorInitialEnergy: 10, // in seconds
        };

        // Create GUI
        this.createGUI()

        // clock to track real time for updates
        this.clock = new THREE.Clock();

        // Take whatever function you're calling this on and creates a
        // permanent execution context. Ensures that when we call render(),
        // "this" is not assumed to be the global "this" but the function reference.
        // Called "hard binding"
        this.render = this.render.bind(this);
    },

    createGUI() {
        const container = document.createElement("div");
        container.id = "guiContainer";
        container.style.width = "320px";
        container.style.position = "fixed";
        container.style.top = "10px";
        container.style.right = "10px";
        container.style.zIndex = 1000;
        document.body.appendChild(container);

        const pane = new Pane({ container: container });

        // Info folder
        const infoFolder = pane.addFolder({ title: "Parameter Info" });
        infoFolder.addBinding(
            { preyCountInfo: "Number of prey to spawn initially" },
            "preyCountInfo",
            { view: "text", label: "Initial Prey Count" }
        );
        infoFolder.addBinding(
            { preySpeedInfo: "How fast the prey move" },
            "preySpeedInfo",
            { view: "text", label: "Prey Speed"}
        );
        infoFolder.addBinding(
            {
                reproductionRateInfo:
                    "How often each prey reproduces (in seconds)",
            },
            "reproductionRateInfo",
            { view: "text", label: "Reproduction Rate" }
        );
        infoFolder.addBinding(
            { predatorCountInfo: "Number of predators to spawn initially" },
            "predatorCountInfo",
            { view: "text", label: "Initial Predator Count" }
        );
        infoFolder.addBinding(
            { predatorSpeedInfo: "How fast predators move" },
            "predatorSpeedInfo",
            { view: "text", label: "Predator Speed" }
        );
        infoFolder.addBinding(
            { predatorEnergyInfo: "Seconds a predator lasts without eating" },
            "predatorEnergyInfo",
            { view: "text", label: "Max Predator Energy" }
        );

        // Prey folder
        const preyFolder = pane.addFolder({ title: "Prey Controls" });
        preyFolder.addBinding(this.params, "preyCount", {
            min: 0,
            max: 100,
            step: 1,
            label: "Initial Prey Count"
        });
        preyFolder.addBinding(this.params, "preySpeed", {
            min: 1,
            max: 100,
            step: 1,
            label: "Prey Speed"
        });
        preyFolder.addBinding(this.params, "reproductionRate", {
            min: 1,
            max: 60,
            step: 1,
            label: "Prey Reproduction Rate (seconds)"
        });

        // Predator folder
        const predatorFolder = pane.addFolder({ title: "Predator Controls" });
        predatorFolder.addBinding(this.params, "predatorCount", {
            min: 0,
            max: 50,
            step: 1,
            label: "Predator Count"
        });
        predatorFolder.addBinding(this.params, "predatorSpeed", {
            min: 1,
            max: 100,
            step: 1,
            label: "Predator Speed"
        });
        predatorFolder.addBinding(this.params, "predatorInitialEnergy", {
            min: 1,
            max: 60,
            step: 1,
            label: "Predator Max Energy (seconds)"
        });

        // Buttons
        pane.addButton({ title: "Start Simulation" }).on("click", () =>
            this.startSim()
        );
        pane.addButton({ title: "End Simulation" }).on("click", () =>
            this.endSim()
        );
    },

    createLights() {
        // Create one point light and add it to the scene
        const pointLight = new THREE.DirectionalLight(0xcccccc, 2);

        // Set the point light's position
        pointLight.position.z = 100;

        // Add the light to the scene
        this.scene.add(pointLight);
    },

    startSim() {
        // Spawn initial prey
        for (let i = 0; i < this.params.preyCount; i++) {
            this.agents.push(new Agent("prey", this.scene, this.params));
        }
        // Spawn initial predators
        for (let i = 0; i < this.params.predatorCount; i++) {
            this.agents.push(new Agent("predator", this.scene, this.params));
        }

        this.clock.start();

        // start the animation loop
        this.render();
    },

    endSim() {
        // Remove all agents from the scene
        this.agents.forEach(agent => this.scene.remove(agent.mesh));

        // Clear the agents array
        this.agents = [];

        this.clock.stop();
    },

    // Animation loop
    render() {
        const delta = this.clock.getDelta(); // get time passed since last frame

        // update the agents
        this.agents.forEach((agent) => agent.update(this.params, this.agents, delta));

        // Render using the scene and camera specified earlier
        this.renderer.render(this.scene, this.camera);

        // Schedules a function to be called the next time the graphics engine
        // refreshes your browser window. Necessary for the animation to occur.
        window.requestAnimationFrame(this.render);
    },
};

window.onload = () => app.init();
