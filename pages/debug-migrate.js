/**
 * 数据库迁移执行页面
 * 访问: /debug-migrate
 */

import { useState } from 'react';

export default function MigratePage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runMigration = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/debug/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: 'migrate-tables-now'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: 'ERROR',
        message: '请求失败',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>🔧 数据库迁移工具</h1>
      
      <div style={{ 
        background: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>⚠️ 注意事项：</h3>
        <ul>
          <li>此工具将创建所有必需的数据库表</li>
          <li>包括：User, Account, Session, VerificationToken, Project</li>
          <li>执行前请确保您有管理员权限</li>
          <li>迁移完成后建议删除此页面</li>
        </ul>
      </div>

      <button
        onClick={runMigration}
        disabled={loading}
        style={{
          background: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? '⏳ 正在执行迁移...' : '🚀 开始数据库迁移'}
      </button>

      {result && (
        <div style={{
          background: result.status === 'SUCCESS' ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.status === 'SUCCESS' ? '#c3e6cb' : '#f5c6cb'}`,
          color: result.status === 'SUCCESS' ? '#155724' : '#721c24',
          padding: '15px',
          borderRadius: '6px',
          marginTop: '20px'
        }}>
          <h3>{result.status === 'SUCCESS' ? '✅ 成功' : '❌ 失败'}</h3>
          <p><strong>消息：</strong> {result.message}</p>
          
          {result.migrationSteps && (
            <div>
              <h4>迁移步骤：</h4>
              <ul>
                {result.migrationSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {result.verification && (
            <div>
              <h4>验证结果：</h4>
              <ul>
                <li>用户数量: {result.verification.userCount}</li>
                <li>项目数量: {result.verification.projectCount}</li>
                <li>已创建表数量: {result.verification.tablesCreated}</li>
              </ul>
            </div>
          )}

          {result.nextSteps && (
            <div>
              <h4>下一步操作：</h4>
              <ul>
                {result.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {result.afterTables && (
            <div>
              <h4>创建的表：</h4>
              <p>{result.afterTables.join(', ')}</p>
            </div>
          )}

          {result.error && (
            <div>
              <h4>错误详情：</h4>
              <pre style={{
                background: '#fff',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto'
              }}>
                {result.error}
              </pre>
            </div>
          )}
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px'
      }}>
        <h4>🔗 相关链接：</h4>
        <ul>
          <li><a href="/api/debug/env-check" target="_blank">检查环境变量</a></li>
          <li><a href="/api/debug/pooler-test" target="_blank">测试数据库连接</a></li>
          <li><a href="/api/debug/tables-check" target="_blank">检查表结构</a></li>
          <li><a href="/" target="_blank">返回主页</a></li>
        </ul>
      </div>
    </div>
  );
} 