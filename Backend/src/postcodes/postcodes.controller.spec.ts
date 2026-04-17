import { Test, TestingModule } from '@nestjs/testing';
import { PostcodesController } from './postcodes.controller';

describe('PostcodesController', () => {
  let controller: PostcodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostcodesController],
    }).compile();

    controller = module.get<PostcodesController>(PostcodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
