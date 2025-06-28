/*
 * RunningHub 应用配置文件
 *
 * 本文件集中管理所有接入的应用的配置信息。
 * 格式与 RunningHub API v2 (nodeInfoList) 保持一致，以提高可维护性和减少错误。
 *
 * 每个应用对象包含：
 * - key: 应用的唯一标识符，用于前端逻辑。
 * - type: 应用类型，用于显示 Badge。
 * - date: 显示日期。
 * - image: 在选择页面展示的预览图。
 * - webappId: 从 RunningHub 获取的应用 WebApp ID。
 * - nodeInfoList: 节点信息列表。
 *   - 每个节点对象定义了 nodeId, fieldName。
 *   - 'user_upload' 是一个特殊占位符，表示该字段的值需要由用户上传的文件ID替换。
 *   - 其他 'fieldValue' 应为该节点的默认值。
 */

export const appsConfig = [
  {
    key: 'animeStyleTransfer',
    type: 'Style Transfer',
    date: '2025-06-23',
    image: '/cover-animestyle.jpg',
    webappId: '1911985272408502273',
    nodeInfoList: [
      { nodeId: '226', fieldName: 'image', fieldValue: 'user_upload' },
    ],
    /*
    validation: {
      image: {
        maxWidth: 1024,
        maxHeight: 1024,
        multiplesOf: 8,
      }
    }
    */
  },
  {
    key: 'aiDoll',
    type: 'AI Generation',
    date: '2025-01-23',
    image: '/cover-aidoll.jpg',
    webappId: '1908473340346904577',
    nodeInfoList: [
      { nodeId: '705', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'polaroidAI',
    type: 'Polaroid AI',
    date: '2025-01-23',
    image: '/cover-polaroid.jpg',
    webappId: '1911618585285066753',
    nodeInfoList: [
      { nodeId: '39', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'ghibliAI',
    type: 'Ghibli AI',
    date: '2025-01-23',
    image: '/cover-ghibli.jpg',
    webappId: '1909454804450746369',
    nodeInfoList: [
      { nodeId: '6', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'labubu',
    type: 'Turn into Labubu',
    date: '2025-01-23',
    image: '/cover-labubu.jpg',
    webappId: '1930601724866908162',
    nodeInfoList: [
      { nodeId: '615', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'photoCutter',
    type: 'phtoo cutter',
    date: '2025-01-23',
    image: '/cover-photocutter.png',
    webappId: '1937714708973817857',
    nodeInfoList: [
      { nodeId: '10', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'breastJiggling',
    type: 'breast jiggling',
    date: '2025-01-23',
    image: '/breast-jiggling.mp4',
    webappId: '1916573359826735105',
    nodeInfoList: [
      { nodeId: '18', fieldName: 'image', fieldValue: 'user_upload' },
    ],
  },
  {
    key: 'aiMermaidFilter',
    type: 'AI Mermaid Filter',
    date: '2025-06-26',
    image: '/ai-mermaid.mp4',
    webappId: '1931579662861053953',
    nodeInfoList: [
      { nodeId: '5', fieldName: 'image', fieldValue: 'user_upload' },
      { nodeId: '43', fieldName: 'value', fieldValue: '6' },
      { nodeId: '41', fieldName: 'text', fieldValue: '海水从画面下面涌上来，女孩变成了美人鱼' },
    ],
  },
  {
    key: 'punchFace',
    type: 'Face Effect',
    date: '2025-06-26',
    image: '/punch-face.mp4',
    webappId: '1935389694761041921',
    nodeInfoList: [
      { nodeId: '103', fieldName: 'image', fieldValue: 'user_upload' },
      { nodeId: '116', fieldName: 'value', fieldValue: '0' },
    ],
  },
]; 