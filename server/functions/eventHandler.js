const { default: Collection } = require('@discordjs/collection');
const fs = require('fs');

class EventHandler {
    constructor() {
        this.eventsFolder = null;
        this.eventTypes = [];
        this.events = [];
    }

    setEventsFolder(path) {
        this.eventsFolder = path;

        return this;
    }
    
    getEventTypes() {
        const eventTypes = fs.readdirSync(this.eventsFolder);

        for(const type of eventTypes) {
            this.eventTypes.push(type);
        }
        return this;
    }

    getEvents() {
        
        for(const type of this.eventTypes) {

            const events = fs.readdirSync(`${this.eventsFolder}/${type}`);

            for(const eventFile of events ) {
                const event = require(`${this.eventsFolder}/${type}/${eventFile}`);

                this.events.push(event);
            }
        }

        return this;
    }

    async handle(client) {
        for(const event of this.events) {
            if(event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        } 
    }
}


module.exports = EventHandler;