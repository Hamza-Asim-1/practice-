import { Test, TestingModule } from '@nestjs/testing';
import { TookanService } from './tookan.service';

describe('TookanService', () => {
  let service: TookanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TookanService],
    }).compile();

    service = module.get<TookanService>(TookanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
