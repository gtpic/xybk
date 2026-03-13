-- 1. 网站配置与账号密码表
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT
);
-- 初始化管理员账号密码（你可以随后在控制台用 SQL 修改）
INSERT INTO config (key, value) VALUES ('admin_username', 'admin');
INSERT INTO config (key, value) VALUES ('admin_password', '123456');

-- 2. 文章表
CREATE TABLE articles (
    id TEXT PRIMARY KEY,
    title TEXT,
    link TEXT,
    createDate TEXT,
    category TEXT,
    tags TEXT,
    content TEXT,
    contentText TEXT, 
    firstImageUrl TEXT,
    isPinned INTEGER DEFAULT 0,   
    hasPassword INTEGER DEFAULT 0,
    password TEXT,
    views INTEGER DEFAULT 0,
    isHidden INTEGER DEFAULT 0,
    allowComments INTEGER DEFAULT 1,
    changefreq TEXT,
    priority TEXT
);

-- 3. 评论表
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    articleSlug TEXT,
    content TEXT,
    contact TEXT, 
    timestamp INTEGER
);

-- 4. 轮播图表
CREATE TABLE carousel (
    id TEXT PRIMARY KEY,
    imageUrl TEXT,
    linkUrl TEXT,
    sortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    name TEXT,
    url TEXT,
    storage_node TEXT,
    upload_date TEXT
);
