namespace UltrasonicSensors {

    export enum COMPARATOR {
        LESS_THAN, GREATER_THAN, EQUALS_TO
    }

    export class UltrasonicSensor {
        private trigPin: number;
        private echoPin: number;
        private readonly jobs: Job[] = [];
        private jobId: number = 0;

        constructor(args: { trigPin: number, echoPin: number }) {
            this.trigPin = args.trigPin;
            this.echoPin = args.echoPin;

            while(true) {
                //execute jobs
            }
        }

        public getDistance(): number {
            return -1;
        }

        public addJob(comparator : UltrasonicSensors.COMPARATOR, distance : number, job : () => void) : number {
            const jobId = ++this.jobId;
            this.jobs.push(new Job(jobId, distance, comparator, job))
            return jobId;
        }

        public removeJob(id : number) {
            
        }

    }

    class Job {
        public readonly id : number;
        public readonly distance : number;
        public readonly comparator : UltrasonicSensors.COMPARATOR;
        public readonly callback : () => void;

        constructor(id : number, distance : number, comparator : UltrasonicSensors.COMPARATOR, callback : () => void) {
            this.id = id;
            this.distance = distance;
            this.comparator = comparator;
            this.callback = callback;
        }
    }
}
