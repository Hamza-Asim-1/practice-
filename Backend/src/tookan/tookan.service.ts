import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TookanService {
    private apiUrl = 'https://api.tookanapp.com/v2/create_task';
    private apiKey: string;

    constructor(private readonly httpService: HttpService) {
        this.apiKey = process.env.TOOKAN_API_KEY || 'tookan_placeholder';
    }

    async createDeliveryTask(orderInfo: any) {
        const response = await firstValueFrom(
            this.httpService.post(this.apiUrl, {
                api_key: this.apiKey,
                job_description: `Delivery for order ${orderInfo.orderId}`,
                job_pickup_phone: orderInfo.supplierPhone,
                job_pickup_name: orderInfo.supplierName,
                job_pickup_address: orderInfo.supplierAddress,
                job_delivery_datetime: new Date(Date.now() + 45 * 60000).toISOString(),
                customer_email: orderInfo.customerEmail,
                customer_username: orderInfo.customerName,
                customer_phone: orderInfo.customerPhone,
                customer_address: orderInfo.customerAddress,
                has_pickup: 1,
                has_delivery: 1,
                layout_type: 0,
                tracking_link: 1,
                timezone: "0", // UTC (UK timezone)
                custom_field_template: "Template_1",
                meta_data: [
                    { label: "Price", data: orderInfo.price }
                ],
                fleet_id: "",
                p_ref_images: [],
                ref_images: [],
                notify: 1,
                tags: ""
            })
        );

        return response.data;
    }
}
