"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TookanService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let TookanService = class TookanService {
    httpService;
    apiUrl = 'https://api.tookanapp.com/v2/create_task';
    apiKey;
    constructor(httpService) {
        this.httpService = httpService;
        this.apiKey = process.env.TOOKAN_API_KEY || 'tookan_placeholder';
    }
    async createDeliveryTask(orderInfo) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(this.apiUrl, {
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
            timezone: "0",
            custom_field_template: "Template_1",
            meta_data: [
                { label: "Price", data: orderInfo.price }
            ],
            fleet_id: "",
            p_ref_images: [],
            ref_images: [],
            notify: 1,
            tags: ""
        }));
        return response.data;
    }
};
exports.TookanService = TookanService;
exports.TookanService = TookanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], TookanService);
//# sourceMappingURL=tookan.service.js.map