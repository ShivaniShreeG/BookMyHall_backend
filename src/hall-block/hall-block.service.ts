import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HallBlockService {
  // 1️⃣ Fetch all hall blocks
  async findAll() {
    const blocks = await prisma.hall_block.findMany({
      select: {
        id: true,
        hall_id: true,
        reason: true,
      },
    });

    if (!blocks.length) throw new NotFoundException(`No hall blocks found`);
    return blocks;
  }

  // 2️⃣ Fetch block by hall_id
  async findByHall(hallId: number) {
    const block = await prisma.hall_block.findUnique({
      where: { hall_id: hallId },
      select: {
        id: true,
        hall_id: true,
        reason: true,
      },
    });

    if (!block)
      throw new NotFoundException(`No block found for hall ID ${hallId}`);
    return block;
  }
}
