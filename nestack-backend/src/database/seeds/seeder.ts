import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../data-source';
import {
  lifecycleCategoriesData,
  missionTemplatesData,
  badgesData,
  defaultAdminData,
} from './seed-data';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Seed Lifecycle Categories
    console.log('📁 Seeding Lifecycle Categories...');
    for (const category of lifecycleCategoriesData) {
      const exists = await dataSource.query(
        `SELECT id FROM lifecycle_categories WHERE id = $1`,
        [category.id],
      );

      if (exists.length === 0) {
        await dataSource.query(
          `INSERT INTO lifecycle_categories (id, name, display_order, status)
           VALUES ($1, $2, $3, $4)`,
          [category.id, category.name, category.displayOrder, category.status],
        );
        console.log(`   ✅ Created category: ${category.name}`);
      } else {
        console.log(`   ⏭️  Skipped (exists): ${category.name}`);
      }
    }
    console.log('');

    // Seed Mission Templates
    console.log('📋 Seeding Mission Templates...');
    for (const template of missionTemplatesData) {
      const exists = await dataSource.query(
        `SELECT id FROM mission_templates WHERE id = $1`,
        [template.id],
      );

      if (exists.length === 0) {
        await dataSource.query(
          `INSERT INTO mission_templates (id, name, description, category_id, goal_type, default_goal_amount, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            template.id,
            template.name,
            template.description,
            template.categoryId,
            template.goalType,
            template.defaultGoalAmount,
            template.status,
          ],
        );
        console.log(`   ✅ Created template: ${template.name}`);
      } else {
        console.log(`   ⏭️  Skipped (exists): ${template.name}`);
      }
    }
    console.log('');

    // Seed Badges
    console.log('🏅 Seeding Badges...');
    for (const badge of badgesData) {
      const exists = await dataSource.query(
        `SELECT id FROM badges WHERE id = $1`,
        [badge.id],
      );

      if (exists.length === 0) {
        await dataSource.query(
          `INSERT INTO badges (id, name, description, image_url, badge_type, condition_type, condition_value)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            badge.id,
            badge.name,
            badge.description,
            badge.imageUrl,
            badge.badgeType,
            badge.conditionType,
            JSON.stringify(badge.conditionValue),
          ],
        );
        console.log(`   ✅ Created badge: ${badge.name}`);
      } else {
        console.log(`   ⏭️  Skipped (exists): ${badge.name}`);
      }
    }
    console.log('');

    // Seed Default Admin User
    console.log('👤 Seeding Default Admin User...');
    const adminExists = await dataSource.query(
      `SELECT id FROM admin_users WHERE id = $1`,
      [defaultAdminData.id],
    );

    if (adminExists.length === 0) {
      const passwordHash = await bcrypt.hash(defaultAdminData.password, 12);
      await dataSource.query(
        `INSERT INTO admin_users (id, email, password_hash, name, role, status)
         VALUES ($1, $2, $3, $4, $5, 'active')`,
        [
          defaultAdminData.id,
          defaultAdminData.email,
          passwordHash,
          defaultAdminData.name,
          defaultAdminData.role,
        ],
      );
      console.log(`   ✅ Created admin: ${defaultAdminData.email}`);
      console.log(`   📧 Email: ${defaultAdminData.email}`);
      console.log(`   🔑 Password: ${defaultAdminData.password}`);
    } else {
      console.log(`   ⏭️  Skipped (exists): ${defaultAdminData.email}`);
    }
    console.log('');

    console.log('✨ Database seeding completed successfully!\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   - Lifecycle Categories: ${lifecycleCategoriesData.length}`);
    console.log(`   - Mission Templates: ${missionTemplatesData.length}`);
    console.log(`   - Badges: ${badgesData.length}`);
    console.log(`   - Admin Users: 1`);
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

seed();
