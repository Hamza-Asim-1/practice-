import { PrismaClient, ProductCategory, ProductStatus, SupplierStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SUPPLIER_ID = '00000000-0000-0000-0000-000000000001';

class ProductFactory {
  static async createCategories() {
    const categories = Object.values(ProductCategory);
    console.log(`🌱 Seeding ${categories.length} categories...`);
    
    for (const catName of categories) {
      await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName }
      });
    }
  }

  static async createSupplier() {
    return prisma.supplier.upsert({
      where: { id: SUPPLIER_ID },
      update: {},
      create: {
        id: SUPPLIER_ID,
        name: 'Teza Premium Farms',
        contactName: 'Ahmad Abdullah',
        phone: '+44 20 8123 4567',
        email: 'partners@teza.com',
        address: '123 Farm Road, London, E1 6AN', // Required field added
        hmcCertNumber: 'HMC-2026-X104',
        status: SupplierStatus.ACTIVE,
      },
    });
  }

  static generateSlug(name: string) {
    return `seed-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
  }

  static async createAdmins() {
    const passwordHash = await bcrypt.hash('password', 10);

    // Super Admin
    await prisma.user.upsert({
      where: { email: 'superadmin@teza.com' },
      update: { passwordHash, role: Role.SUPER_ADMIN },
      create: {
        email: 'superadmin@teza.com',
        passwordHash: passwordHash,
        role: Role.SUPER_ADMIN,
      },
    });

    // Ops Admin
    await prisma.user.upsert({
      where: { email: 'opsadmin@teza.com' },
      update: { passwordHash, role: Role.OPS_ADMIN },
      create: {
        email: 'opsadmin@teza.com',
        passwordHash: passwordHash,
        role: Role.OPS_ADMIN,
      },
    });
  }

  static async createProducts(supplierId: string) {
      const categories = await prisma.category.findMany();
      if (categories.length === 0) return;

      const products = [
          { name: 'Premium Wagyu Ribeye', categoryName: 'BEEF', price: 85.00 },
          { name: 'Organic Lamb Chops', categoryName: 'LAMB', price: 24.50 },
          { name: 'Free Range Chicken Breast', categoryName: 'POULTRY', price: 12.99 },
      ];

      for (const p of products) {
          const category = categories.find(c => c.name === p.categoryName);
          if (!category) continue;

          await prisma.product.create({
              data: {
                  supplierId,
                  categoryId: category.id,
                  category: category.name as ProductCategory,
                  name: p.name,
                  basePrice: p.price,
                  approvalStatus: 'APPROVED',
                  status: 'LIVE',
                  isHmcCertified: true,
                  stock: {
                      create: {
                          quantity: 100
                      }
                  }
              }
          });
      }
  }

  static async seed() {
    console.log('--- 🚀 Starting Teza Marketplace Seed ---');
    
    await this.createAdmins();
    console.log('✅ Admins initialized');

    await this.createCategories();
    console.log('✅ Categories initialized');

    const supplier = await this.createSupplier();
    console.log('✅ Default supplier initialized');

    await this.createProducts(supplier.id);
    console.log('✅ Sample products initialized');

    console.log('--- 🏁 Seeding Finished ---');
  }
}

ProductFactory.seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
