import { AppDataSource } from '../src/config/database';
import { User } from '../src/modules/user/user.entity';

async function checkDuplicateUsers() {
  console.log('🔍 Checking for duplicate users...\n');

  try {
    await AppDataSource.initialize();
    
    const userRepo = AppDataSource.getRepository(User);
    
    // Check specific email
    const targetEmail = 'redhorse787422@gmail.com';
    const users = await userRepo.find({ 
      where: { email: targetEmail },
      order: { createdAt: 'ASC' }
    });
    
    console.log(`Users with email ${targetEmail}:`, users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Type: ${user.type}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log('');
    });
    
    // Check for all duplicate emails
    const allUsers = await userRepo.find({
      order: { email: 'ASC' }
    });
    
    const emailCounts: { [key: string]: number } = {};
    allUsers.forEach(user => {
      emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
    });
    
    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    
    if (duplicates.length > 0) {
      console.log('🚨 Found duplicate emails:');
      duplicates.forEach(([email, count]) => {
        console.log(`- ${email}: ${count} users`);
      });
    } else {
      console.log('✅ No duplicate emails found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkDuplicateUsers(); 