import { FirestoreClient } from "./init";
import { RunService, HttpService } from "@rbxts/services";

export interface IQueuedRequest {
	req: RequestAsyncRequest;
	resolve: (res: RequestAsyncResponse) => void;
	reject: (err: string) => void;
}

export class HttpQueue {
	private client: FirestoreClient;

	private startingRequests = 250;
	private requestsLeft: number;
	private timeToReset = 60;

	public httpQueue = new Array<IQueuedRequest>();

	public constructor(client: FirestoreClient) {
		this.client = client;

		this.requestsLeft = this.startingRequests;

		const queue = this;
		spawn(() => {
			queue.queueThread();
		});
	}

	private processQueueItem(queueItem: IQueuedRequest) {
		let res;

		queueItem.req.Headers = {
			Authorization: `Bearer ${this.client.currentToken}`,
		};

		if (queueItem.req.Body) {
			queueItem.req.Headers["Content-Type"] = "application/json";
		}

		try {
			res = HttpService.RequestAsync(queueItem.req);
		} catch (e) {
			return queueItem.reject(e as string);
		}

		return queueItem.resolve(res);
	}

	private queueThread() {
		let lastUpdate = tick();

		for (;;) {
			this.timeToReset = this.timeToReset - (tick() - lastUpdate);
			lastUpdate = tick();

			if (this.timeToReset <= 0) {
				this.requestsLeft = this.startingRequests;
				this.timeToReset = 60;
			}

			while (this.httpQueue.size() > 0) {
				if (this.requestsLeft <= 0) {
					break;
				}

				if (!this.client.canProcessQueue()) {
					break;
				}

				this.requestsLeft = this.requestsLeft - 1;
				this.processQueueItem(this.httpQueue.pop() as IQueuedRequest);
			}

			RunService.Heartbeat.Wait();
		}
	}

	public request(req: RequestAsyncRequest): Promise<RequestAsyncResponse> {
		return new Promise((resolve, reject) => {
			Promise.spawn(() => {
				this.httpQueue.unshift({
					req,
					resolve,
					reject,
				});
			});
		});
	}
}
