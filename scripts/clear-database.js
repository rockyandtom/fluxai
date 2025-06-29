const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log(chalk.blue('\n🗑️ 开始清理数据库...\n'));
  
  try {
    // 连接数据库
    await prisma.$connect();
    console.log(chalk.green('✓ 数据库连接成功'));
    
    // 显示清理前的数据统计
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const sessionCount = await prisma.session.count();
    const accountCount = await prisma.account.count();
    
    console.log(chalk.yellow('\n📊 清理前的数据统计:'));
    console.log(`  用户数量: ${userCount}`);
    console.log(`  项目数量: ${projectCount}`);
    console.log(`  会话数量: ${sessionCount}`);
    console.log(`  账户数量: ${accountCount}`);
    
    if (userCount === 0) {
      console.log(chalk.green('\n✨ 数据库已经是空的，无需清理。'));
      return;
    }
    
    // 询问确认（生产安全检查）
    console.log(chalk.red('\n⚠️  警告：此操作将删除所有用户数据，包括:'));
    console.log(chalk.red('   - 所有用户账户'));
    console.log(chalk.red('   - 所有用户项目'));
    console.log(chalk.red('   - 所有登录会话'));
    console.log(chalk.red('   - 所有OAuth账户关联'));
    
    // 由于这是脚本运行，我们直接执行（在生产中可以添加交互确认）
    console.log(chalk.yellow('\n🔄 开始清理数据...'));
    
    // 按照外键依赖关系的顺序删除
    
    // 1. 删除会话 (sessions)
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(chalk.green(`✓ 已删除 ${deletedSessions.count} 个会话`));
    
    // 2. 删除OAuth账户 (accounts)
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(chalk.green(`✓ 已删除 ${deletedAccounts.count} 个OAuth账户`));
    
    // 3. 删除项目 (projects)
    const deletedProjects = await prisma.project.deleteMany({});
    console.log(chalk.green(`✓ 已删除 ${deletedProjects.count} 个项目`));
    
    // 4. 删除用户 (users)
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(chalk.green(`✓ 已删除 ${deletedUsers.count} 个用户`));
    
    // 验证清理结果
    const finalUserCount = await prisma.user.count();
    const finalProjectCount = await prisma.project.count();
    const finalSessionCount = await prisma.session.count();
    const finalAccountCount = await prisma.account.count();
    
    console.log(chalk.green('\n📊 清理后的数据统计:'));
    console.log(chalk.green(`  用户数量: ${finalUserCount}`));
    console.log(chalk.green(`  项目数量: ${finalProjectCount}`));
    console.log(chalk.green(`  会话数量: ${finalSessionCount}`));
    console.log(chalk.green(`  账户数量: ${finalAccountCount}`));
    
    if (finalUserCount === 0 && finalProjectCount === 0 && finalSessionCount === 0 && finalAccountCount === 0) {
      console.log(chalk.green('\n🎉 数据库清理成功！所有用户数据已被删除。'));
    } else {
      console.log(chalk.yellow('\n⚠️  警告：数据库清理可能不完整，请检查。'));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ 数据库清理失败:'), error.message);
    
    if (error.code === 'P1001') {
      console.error(chalk.red('数据库连接失败，请检查 DATABASE_URL 配置'));
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log(chalk.gray('\n🔌 数据库连接已断开'));
  }
}

// 如果直接运行这个脚本
if (require.main === module) {
  clearDatabase()
    .then(() => {
      console.log(chalk.green('\n✅ 数据库清理完成'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('\n💥 清理过程中发生错误:'), error);
      process.exit(1);
    });
}

module.exports = clearDatabase; 