import { HttpService } from '@nestjs/axios';
export declare class TookanService {
    private readonly httpService;
    private apiUrl;
    private apiKey;
    constructor(httpService: HttpService);
    createDeliveryTask(orderInfo: any): Promise<any>;
}
