import EventEmitter from "events";

class SSEController {
  constructor() {
    this.emitter = new EventEmitter();
  }

  getEmitter() {
    return this.emitter;
  }

  listen(url) {
    this.source = new EventSource(url);

    this.source.onmessage = (e) => this.ingest(e);
    this.source.addEventListener("data", (e) => this.ingest(e));

    this.source.onerror = (err) => this.emitter.emit("error", err);
    this.source.addEventListener("error", (err) =>
      this.emitter.emit("error", err)
    );
  }

  close() {
    this.source?.close();
  }

  ingest(e) {
    this.emitter.emit("data", e.data);
  }
}

const SSEControllerSingleton = new SSEController();

export { SSEControllerSingleton, SSEController };
