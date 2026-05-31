-- ============================================================
--  JobHot – Complete Database Schema + Seed Data
--  Database: jobhot
--  Sources: Dashboard.jsx, Employer.jsx, JobDetail.jsx
--  Created: May 26, 2026
-- ============================================================

CREATE DATABASE
IF NOT EXISTS jobhot
    CHARACTER
SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE jobhot;


-- ============================================================
-- TABLE 1: USERS
--    role    : 'user' = job seeker | 'employer' | 'admin'
--    avatar  : base64 data-URI stored directly (max ~2 MB)
--    company : employer company name
-- ============================================================

CREATE TABLE
IF NOT EXISTS users
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR
(100)  NOT NULL,
    email       VARCHAR
(150)  NOT NULL UNIQUE,
    password    VARCHAR
(255)  NOT NULL,
    role        ENUM
('user','employer','admin') NOT NULL DEFAULT 'user',
    status      ENUM
('active','suspended')      NOT NULL DEFAULT 'active',

    -- Registration extras
    avatar      MEDIUMTEXT   DEFAULT NULL,
    company     VARCHAR
(200) DEFAULT NULL,
    industry    VARCHAR
(100) DEFAULT NULL,

    -- Profile fields (UserProfileModal)
    phone       VARCHAR
(20)  DEFAULT NULL,
    dob         DATE         DEFAULT NULL,
    gender      VARCHAR
(20)  DEFAULT NULL,
    address     VARCHAR
(200) DEFAULT NULL,
    position    VARCHAR
(100) DEFAULT NULL,
    experience  VARCHAR
(50)  DEFAULT NULL,
    skills      TEXT         DEFAULT NULL,
    bio         TEXT         DEFAULT NULL,
    education   VARCHAR(255) DEFAULT NULL,
    cv_data     LONGTEXT     DEFAULT NULL,
    cv_name     VARCHAR(255) DEFAULT NULL,
    website     VARCHAR(255) DEFAULT NULL,
    company_size VARCHAR(50) DEFAULT NULL,

    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 2: OTP TOKENS  (forgot-password flow)
-- ============================================================

CREATE TABLE
IF NOT EXISTS otp_tokens
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR
(150) NOT NULL,
    otp         VARCHAR
(6)   NOT NULL,
    expires_at  DATETIME     NOT NULL,
    used        TINYINT
(1)   DEFAULT 0,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 3: CATEGORIES  (admin CategoriesTab)
-- ============================================================

CREATE TABLE
IF NOT EXISTS categories
(
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR
(100) NOT NULL UNIQUE,
    icon        VARCHAR
(10)  DEFAULT '📂',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 4: JOBS
--    All columns from both the base schema AND JobDetail.jsx
--    mockJobDetails (benefits, responsibilities, quantity,
--    gender, experience, company_size, company_field,
--    company_address, company_description) are defined here
--    from the start — no ALTER TABLE needed.
--    applicants: denormalised counter kept in sync with
--                the applications table.
-- ============================================================

CREATE TABLE
IF NOT EXISTS jobs
(
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    employer_id         INT          DEFAULT NULL,
    category_id         INT          DEFAULT NULL,

    -- Basic info
    title               VARCHAR
(200) NOT NULL,
    company             VARCHAR
(200) NOT NULL,
    logo                VARCHAR
(500) DEFAULT NULL,
    location            VARCHAR
(100) NOT NULL,
    work_type           VARCHAR
(50)  NOT NULL,
    level               VARCHAR
(50)  NOT NULL,
    salary              VARCHAR
(100) DEFAULT NULL,

    -- Detailed content
    description         TEXT         DEFAULT NULL,
    requirements        TEXT         DEFAULT NULL,
    benefits            TEXT         DEFAULT NULL,
    responsibilities    TEXT         DEFAULT NULL,

    -- Extra meta (JobDetail sidebar)
    quantity            INT          DEFAULT NULL,
    gender              VARCHAR
(50)  DEFAULT NULL,
    experience          VARCHAR
(50)  DEFAULT NULL,

    -- Company profile (JobDetail company card)
    company_website     VARCHAR
(300) DEFAULT NULL,
    company_size        VARCHAR
(100) DEFAULT NULL,
    company_field       VARCHAR
(100) DEFAULT NULL,
    company_address     VARCHAR
(255) DEFAULT NULL,
    company_description TEXT         DEFAULT NULL,

    -- Admin / listing fields
    applicants          INT          DEFAULT 0,
    deadline            DATE         DEFAULT NULL,
    status              ENUM
('pending','active','closed') NOT NULL DEFAULT 'active',
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY
(employer_id) REFERENCES users
(id)      ON
DELETE
SET NULL
,
    FOREIGN KEY
(category_id) REFERENCES categories
(id) ON
DELETE
SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 5: APPLICATIONS
--    Job seekers apply to jobs.
--    AppliedJobsModal reads this via action=get-applied-jobs.
-- ============================================================

CREATE TABLE
IF NOT EXISTS applications
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    job_id     INT NOT NULL,
    user_id    INT NOT NULL,
    status     ENUM
('new','reviewing','shortlisted','rejected') NOT NULL DEFAULT 'new',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY
(job_id)  REFERENCES jobs
(id)  ON
DELETE CASCADE,
    FOREIGN KEY (user_id)
REFERENCES users
(id) ON
DELETE CASCADE,
    UNIQUE KEY uq_application (job_id, user_id
)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 6: SAVED JOBS  (SavedJobsModal)
-- ============================================================

CREATE TABLE
IF NOT EXISTS saved_jobs
(
    id       INT AUTO_INCREMENT PRIMARY KEY,
    job_id   INT NOT NULL,
    user_id  INT NOT NULL,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY
(job_id)  REFERENCES jobs
(id)  ON
DELETE CASCADE,
    FOREIGN KEY (user_id)
REFERENCES users
(id) ON
DELETE CASCADE,
    UNIQUE KEY uq_saved (job_id, user_id
)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 7: SITE RATINGS  (Contact page — 1-5 stars)
-- ============================================================

CREATE TABLE
IF NOT EXISTS site_ratings
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    rating     TINYINT     NOT NULL,
    comment    TEXT        DEFAULT NULL,
    ip         VARCHAR
(45) DEFAULT NULL,
    created_at DATETIME    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- TABLE 8: TALENT POOL  (Employer.jsx TalentTab)
--    Open candidates that employers can browse without a
--    formal application against a specific job posting.
-- ============================================================

CREATE TABLE
IF NOT EXISTS talent_pool
(
    id          VARCHAR
(10)  PRIMARY KEY,
    full_name   VARCHAR
(100) NOT NULL,
    position    VARCHAR
(100) NOT NULL,
    experience  VARCHAR
(50)  DEFAULT NULL,
    skills      TEXT         DEFAULT NULL,
    location    VARCHAR
(100) DEFAULT NULL,
    email       VARCHAR
(150) DEFAULT NULL,
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- SEED DATA
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. USERS  (14 records)
--    Sources: Dashboard.jsx MOCK_USERS
--             Employer.jsx  MOCK_CANDIDATES
-- ════════════════════════════════════════════════════════════

INSERT INTO users
    (id, full_name, email, password, role, status, company, position, experience, skills, bio, education, created_at)
VALUES

    -- Admin
    -- Password: Abc123.,/
    (1, 'Quản trị viên JobHot', 'admin@jobhot.vn', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'admin', 'active', NULL, NULL, NULL, NULL,
        NULL, NULL, '2026-04-15 10:00:00'),

    -- Basic job seekers (Dashboard.jsx MOCK_USERS)
    -- Password: Abc123.,/
    (2, 'Nguyễn Văn A', 'a@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-01 08:30:00'),
    (3, 'Lê Văn C', 'c@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-03 09:15:00'),
    (5, 'Hoàng E', 'e@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-05 14:20:00'),

    -- Job seekers with full profiles (Employer.jsx MOCK_CANDIDATES)
    -- Password: Abc123.,/
    (6, 'Nguyễn Thị Bình', 'binh@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'Frontend Developer', '2-3 năm', 'React,TypeScript,CSS',
        'Lập trình viên frontend với 2 năm kinh nghiệm làm việc với React ecosystem. Đam mê tạo ra UI đẹp và hiệu suất cao.',
        'Đại học Bách Khoa Hà Nội - Công nghệ thông tin', '2026-05-03 10:00:00'),

    (7, 'Trần Văn Cường', 'cuong@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'Full Stack Developer', '3-5 năm', 'Node.js,React,PostgreSQL,Docker',
        'Senior developer với 4 năm kinh nghiệm xây dựng hệ thống web quy mô lớn. Có kinh nghiệm dẫn dắt team nhỏ.',
        'Đại học Quốc gia Hà Nội - Khoa học máy tính', '2026-05-04 11:00:00'),

    (8, 'Lê Minh Dũng', 'dung@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'Backend Developer', '1-2 năm', 'Python,Django,MySQL',
        'Junior developer mới tốt nghiệp, nhiệt huyết học hỏi và sẵn sàng thử thách mới.',
        'Đại học Công nghệ TP.HCM - CNTT', '2026-05-05 12:30:00'),

    (9, 'Phạm Thị Hoa', 'hoa@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'Digital Marketing Specialist', '2-3 năm', 'Facebook Ads,Google Ads,SEO,Analytics',
        'Chuyên viên marketing với kinh nghiệm quản lý ngân sách quảng cáo trên 200 triệu/tháng.',
        'Đại học Kinh tế TP.HCM - Marketing', '2026-05-03 13:45:00'),

    (10, 'Hoàng Văn Em', 'em@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'UI/UX Designer', '2-3 năm', 'Figma,Adobe XD,Prototyping,User Research',
        'Designer với niềm đam mê tạo ra trải nghiệm người dùng tuyệt vời. Portfolio đa dạng từ mobile đến web.',
        'Đại học Mỹ thuật Công nghiệp Hà Nội', '2026-05-07 14:10:00'),

    (11, 'Vũ Thị Phương', 'phuong@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'user', 'active', NULL,
        'Senior UX Designer', '3-5 năm', 'Figma,User Research,Design System,Motion Design',
        'Senior designer với 4 năm kinh nghiệm, từng làm tại các startup công nghệ lớn tại Việt Nam.',
        'RMIT Việt Nam - Đa phương tiện', '2026-05-08 15:20:00'),

    -- Employers (Dashboard.jsx MOCK_USERS + Employer.jsx)
    -- Password: Abc123.,/
    (4, 'Trần Thị B', 'b@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'employer', 'active', 'FPT Software', NULL, NULL, NULL, NULL, NULL, '2026-05-02 08:00:00'),
    (12, 'Phạm Thị D', 'd@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'employer', 'suspended', 'Admicro', NULL, NULL, NULL, NULL, NULL, '2026-05-04 09:30:00'),
    (13, 'Nguyễn Minh Huy', 'huy2@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'employer', 'active', 'MOMO', NULL, NULL, NULL, NULL, NULL, '2026-05-06 10:00:00'),
    (14, 'Trương Văn Kiên', 'kien@email.com', '$2y$12$t8fGvc1EdkcN3SMG/jUbj.XQeCzBrcwVQ/uuimHWBJ9f1GoD3p02e',
        'employer', 'active', 'Samsung Vina', NULL, NULL, NULL, NULL, NULL, '2026-05-05 11:15:00');


-- ════════════════════════════════════════════════════════════
-- 2. CATEGORIES  (16 records)
--    Vietnamese names: JobList.jsx + Landing.jsx + Sidebar.jsx
--    English names   : Dashboard.jsx DEFAULT_CATEGORIES
-- ════════════════════════════════════════════════════════════

INSERT INTO categories
    (id, name, icon)
VALUES
    -- Vietnamese (used by job listings & sidebar)
    (1, 'Công nghệ thông tin', '💻'),
    (2, 'Marketing / PR', '📣'),
    (3, 'Thiết kế', '🎨'),
    (4, 'Tài chính / Kế toán', '💰'),
    (5, 'Y tế / Sức khoẻ', '🏥'),
    (6, 'Giáo dục / Đào tạo', '📚'),
    (7, 'Xây dựng', '🏗️'),
    (8, 'Logistics / Vận tải', '🚚'),
    (9, 'Nhân sự', '👥'),
    (10, 'Kinh doanh / Bán hàng', '💼'),
    (11, 'Dịch vụ khách hàng', '📞'),
    -- English (used by admin Dashboard DEFAULT_CATEGORIES)
    (12, 'IT & Software', '💻'),
    (13, 'Marketing', '📣'),
    (14, 'Finance', '💰'),
    (15, 'Healthcare', '🏥'),
    (16, 'Government', '🏛️');


-- ════════════════════════════════════════════════════════════
-- 3. JOBS  (10 records)
--    Sources: JobList.jsx (1-6)
--             Employer.jsx MOCK_JOBS (7-9)
--             Dashboard.jsx MOCK_JOBS / JobDetail.jsx (1-3 detail, 7-10 applicants)
--
--    jobs 1-3 carry the full detail data from JobDetail.jsx
--    (benefits, responsibilities, quantity, gender, experience,
--     company profile) — all stored in the columns defined above.
-- ════════════════════════════════════════════════════════════

INSERT INTO jobs
    (
    id, employer_id, category_id,
    title, company, location, work_type, level, salary,
    description, requirements, benefits, responsibilities,
    quantity, gender, experience,
    company_website, company_size, company_field,
    company_address, company_description,
    applicants, deadline, status, created_at
    )
VALUES

    -- ── Job 1: Trưởng Phòng Đào Tạo ─────────────────────────
    (1, 4, 6,
        'Trưởng Phòng Đào Tạo - Tập Đoàn Giáo Dục Lớn',
        'Công ty TNHH Giáo Dục ABC', 'Hà Nội', 'Full-time', 'Quản lý', '15-20 triệu',
        'Chúng tôi đang tìm kiếm một Trưởng Phòng Đào Tạo có kinh nghiệm để lãnh đạo và phát triển các chương trình đào tạo chất lượng cao. Đây là cơ hội tuyệt vời để bạn phát triển sự nghiệp trong một môi trường năng động và chuyên nghiệp.',
        'Tốt nghiệp Đại học chuyên ngành Sư phạm, Giáo dục hoặc liên quan\nCó ít nhất 3 năm kinh nghiệm ở vị trí tương đương\nKỹ năng lãnh đạo và quản lý đội nhóm tốt\nKỹ năng giao tiếp và thuyết trình xuất sắc\nThành thạo tin học văn phòng và các công cụ đào tạo trực tuyến\nCó khả năng làm việc độc lập và chịu áp lực cao',
        'Lương cạnh tranh từ 15-20 triệu + thưởng theo hiệu quả\nBảo hiểm đầy đủ theo quy định\nMôi trường làm việc chuyên nghiệp, năng động\nCơ hội thăng tiến rõ ràng\nĐào tạo và phát triển kỹ năng thường xuyên\nTeam building, du lịch hàng năm',
        'Xây dựng và triển khai các chương trình đào tạo\nQuản lý và phát triển đội ngũ giảng viên\nĐánh giá hiệu quả đào tạo và cải tiến liên tục\nPhối hợp với các phòng ban khác để đảm bảo chất lượng đào tạo\nBáo cáo định kỳ cho Ban Giám Đốc',
        2, 'Không yêu cầu', '3-5 năm',
        'https://giaoduc-abc.vn', '200-500 nhân viên', 'Giáo dục / Đào tạo',
        '123 Đường Láng, Đống Đa, Hà Nội',
        'Công ty TNHH Giáo Dục ABC là một trong những tập đoàn giáo dục hàng đầu Việt Nam với hơn 15 năm kinh nghiệm trong lĩnh vực đào tạo và phát triển nguồn nhân lực.',
        0, '2026-06-15', 'active', '2026-05-01 08:00:00'),

    -- ── Job 2: Kỹ Sư Xây Dựng Cầu Đường ────────────────────
    (2, 4, 7,
        'Kỹ Sư Xây Dựng Cầu Đường - Dự Án Long An',
        'Công ty Xây Dựng XYZ', 'Hồ Chí Minh', 'Full-time', 'Nhân viên', '12-18 triệu',
        'Tuyển dụng Kỹ Sư Xây Dựng Cầu Đường cho dự án lớn tại Long An. Cơ hội làm việc với các dự án hạ tầng quy mô lớn và phát triển chuyên môn.',
        'Tốt nghiệp Đại học chuyên ngành Xây dựng Cầu Đường\nCó 2-4 năm kinh nghiệm trong lĩnh vực xây dựng\nThành thạo AutoCAD, Civil 3D\nCó khả năng đọc và hiểu bản vẽ kỹ thuật\nChịu được áp lực công việc cao',
        'Lương từ 12-18 triệu + phụ cấp công trình\nBảo hiểm đầy đủ\nHỗ trợ nhà ở tại công trường\nThưởng theo tiến độ dự án\nCơ hội thăng tiến',
        'Giám sát thi công các hạng mục cầu đường\nKiểm tra chất lượng công trình\nLập báo cáo tiến độ\nPhối hợp với các bên liên quan',
        5, 'Nam', '2-4 năm',
        'https://xaydung-xyz.vn', '500-1000 nhân viên', 'Xây dựng / Hạ tầng',
        '456 Nguyễn Văn Linh, Quận 7, TP.HCM',
        'Công ty Xây Dựng XYZ chuyên thực hiện các dự án hạ tầng giao thông lớn trên toàn quốc.',
        0, '2026-06-10', 'active', '2026-05-01 08:30:00'),

    -- ── Job 3: Nhân Viên Kế Toán Tổng Hợp ──────────────────
    (3, 4, 4,
        'Nhân Viên Kế Toán Tổng Hợp',
        'Công ty Tài Chính DEF', 'Đà Nẵng', 'Full-time', 'Nhân viên', '8-12 triệu',
        'Tuyển dụng Nhân Viên Kế Toán Tổng Hợp có kinh nghiệm. Môi trường làm việc chuyên nghiệp trong lĩnh vực tài chính.',
        'Tốt nghiệp Đại học chuyên ngành Kế toán, Tài chính\nCó 1-2 năm kinh nghiệm kế toán tổng hợp\nThành thạo Excel, phần mềm kế toán\nCẩn thận, tỉ mỉ, trung thực\nCó chứng chỉ kế toán là một lợi thế',
        'Lương 8-12 triệu + thưởng\nBảo hiểm đầy đủ\nLàm việc giờ hành chính\nMôi trường chuyên nghiệp\nĐào tạo nghiệp vụ',
        'Hạch toán các nghiệp vụ kế toán\nLập báo cáo tài chính\nKiểm tra chứng từ\nQuyết toán thuế',
        1, 'Không yêu cầu', '1-2 năm',
        'https://taichinh-def.vn', '50-100 nhân viên', 'Tài chính / Ngân hàng',
        '789 Lê Duẩn, Hải Châu, Đà Nẵng',
        'Công ty Tài Chính DEF cung cấp các dịch vụ tài chính và tư vấn đầu tư chuyên nghiệp.',
        0, '2026-05-21', 'active', '2026-05-01 09:00:00'),

    -- ── Job 4: Nhân Viên Kinh Doanh Bất Động Sản ────────────
    (4, 4, 10,
        'Nhân Viên Kinh Doanh Bất Động Sản',
        'Công ty BĐS GHI', 'Hà Nội', 'Full-time', 'Nhân viên', '10-15 triệu',
        'Tuyển dụng Nhân Viên Kinh Doanh Bất Động Sản với khả năng giao tiếp tốt.',
        'Tốt nghiệp Trung cấp, Cao đẳng trở lên\nCó kỹ năng bán hàng, giao tiếp tốt',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        0, '2026-05-26', 'active', '2026-05-01 09:30:00'),

    -- ── Job 5: Full Stack (JKL) ──────────────────────────────
    (5, 4, 1,
        'Lập Trình Viên Full Stack - ReactJS & Node.js',
        'Công ty Công Nghệ JKL', 'Hồ Chí Minh', 'Full-time', 'Senior', '20-35 triệu',
        'Phát triển và duy trì các ứng dụng web sử dụng ReactJS ở frontend và Node.js ở backend. Tham gia thiết kế kiến trúc hệ thống, review code và mentor junior developer.',
        'Tối thiểu 2 năm kinh nghiệm React, Node.js\nThành thạo TypeScript, REST API, Git\nCó kinh nghiệm với PostgreSQL hoặc MongoDB',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        0, '2026-06-15', 'active', '2026-05-01 10:00:00'),

    -- ── Job 6: Digital Marketing (MNO) ──────────────────────
    (6, 4, 2,
        'Nhân Viên Marketing - Digital Marketing',
        'Công ty Truyền Thông MNO', 'Hà Nội', 'Full-time', 'Nhân viên', '10-15 triệu',
        'Lên kế hoạch và triển khai chiến dịch marketing đa kênh. Phân tích hiệu quả và tối ưu ngân sách.',
        'Có kinh nghiệm chạy quảng cáo Facebook/Google Ads\nHiểu biết về SEO, Content Marketing',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        0, '2026-05-30', 'active', '2026-05-02 08:00:00'),

    -- ── Job 7: Full Stack (FPT) — Dashboard JP001 ────────────
    (7, 4, 1,
        'Lập Trình Viên Full Stack - ReactJS & Node.js',
        'FPT Software', 'Hà Nội', 'Full-time', 'Senior', '20-35 triệu',
        'Phát triển và duy trì các ứng dụng web sử dụng ReactJS ở frontend và Node.js ở backend. Tham gia thiết kế kiến trúc hệ thống, review code và mentor junior developer.',
        'Tối thiểu 2 năm kinh nghiệm React, Node.js\nThành thạo TypeScript, REST API, Git\nCó kinh nghiệm với PostgreSQL hoặc MongoDB',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        14, '2026-06-15', 'active', '2026-05-01 08:00:00'),

    -- ── Job 8: Marketing Digital (Admicro) — Dashboard JP002 ─
    (8, 12, 2,
        'Nhân Viên Marketing Digital',
        'Admicro', 'Hồ Chí Minh', 'Full-time', 'Nhân viên', '10-15 triệu',
        'Lên kế hoạch và triển khai chiến dịch marketing đa kênh. Phân tích hiệu quả và tối ưu ngân sách.',
        'Có kinh nghiệm chạy quảng cáo Facebook/Google Ads\nHiểu biết về SEO, Content Marketing',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        7, '2026-05-30', 'active', '2026-05-02 08:00:00'),

    -- ── Job 9: UX/UI (MOMO) — Dashboard JP003 ────────────────
    (9, 13, 3,
        'Thiết Kế UX/UI - Mobile App',
        'MOMO', 'Hà Nội', 'Full-time', 'Senior', '18-28 triệu',
        'Nghiên cứu người dùng, tạo wireframe và prototype cho ứng dụng mobile.',
        'Thành thạo Figma, Adobe XD\nCó portfolio thể hiện kinh nghiệm thiết kế mobile',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        22, '2026-06-25', 'closed', '2026-05-06 08:00:00'),

    -- ── Job 10: Data Engineer (Samsung) — Dashboard JP004 ────
    (10, 14, 1,
        'Kỹ Sư Dữ Liệu',
        'Samsung Vina', 'Hà Nội', 'Full-time', 'Senior', '22-32 triệu',
        'Xây dựng và tối ưu hóa hệ thống xử lý dữ liệu lớn.',
        'Kinh nghiệm 3+ năm\nThành thạo Python, Spark, SQL',
        NULL, NULL,
        NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL,
        9, '2026-06-30', 'active', '2026-05-05 08:00:00');


-- ════════════════════════════════════════════════════════════
-- 4. APPLICATIONS  (6 records)
--    Source: Employer.jsx MOCK_CANDIDATES
-- ════════════════════════════════════════════════════════════

INSERT INTO applications
    (id, job_id, user_id, status, applied_at)
VALUES
    (1, 7, 6, 'reviewing', '2026-05-03 10:30:00'),
    (2, 7, 7, 'shortlisted', '2026-05-04 11:45:00'),
    (3, 7, 8, 'new', '2026-05-05 13:20:00'),
    (4, 8, 9, 'shortlisted', '2026-05-03 14:00:00'),
    (5, 9, 10, 'new', '2026-05-07 15:30:00'),
    (6, 9, 11, 'reviewing', '2026-05-08 16:45:00');


-- ════════════════════════════════════════════════════════════
-- 5. SAVED JOBS  (4 records)
-- ════════════════════════════════════════════════════════════

INSERT INTO saved_jobs
    (id, job_id, user_id, saved_at)
VALUES
    (1, 5, 6, '2026-05-04 09:00:00'),
    (2, 7, 7, '2026-05-05 10:15:00'),
    (3, 1, 8, '2026-05-06 11:30:00'),
    (4, 10, 9, '2026-05-07 12:45:00');


-- ════════════════════════════════════════════════════════════
-- 6. SITE RATINGS  (4 records)
--    Source: Contact.jsx
-- ════════════════════════════════════════════════════════════

INSERT INTO site_ratings
    (rating, comment, ip, created_at)
VALUES
    (5, 'Nền tảng tuyệt vời, dễ sử dụng và nhiều việc làm!', '203.162.0.1', '2026-05-01 15:20:00'),
    (4, 'Rất hữu ích, nhưng cần cải thiện bộ lọc một chút', '203.162.0.2', '2026-05-02 16:30:00'),
    (5, 'Tìm được việc làm ý trong vòng 2 tuần!', '203.162.0.3', '2026-05-03 17:45:00'),
    (3, 'Còn một số lỗi nhỏ nhưng nhìn chung tốt', '203.162.0.4', '2026-05-04 18:50:00');


-- ════════════════════════════════════════════════════════════
-- 7. TALENT POOL  (6 records)
--    Source: Employer.jsx MOCK_TALENT_POOL
-- ════════════════════════════════════════════════════════════

INSERT INTO talent_pool
    (id, full_name, position, experience, skills, location, email)
VALUES
    ('T001', 'Đinh Quốc Huy', 'Data Engineer', '3-5 năm', 'Python,Spark,Airflow,SQL', 'Hà Nội', 'huy@email.com'),
    ('T002', 'Bùi Thị Lan', 'Product Manager', '2-3 năm', 'Agile,Jira,Figma,SQL', 'Hồ Chí Minh', 'lan@email.com'),
    ('T003', 'Ngô Văn Minh', 'DevOps Engineer', '3-5 năm', 'Docker,Kubernetes,AWS,Terraform', 'Hà Nội', 'minh@email.com'),
    ('T004', 'Trịnh Thị Nga', 'React Developer', '1-2 năm', 'React,JavaScript,CSS,Redux', 'Đà Nẵng', 'nga@email.com'),
    ('T005', 'Cao Minh Phát', 'iOS Developer', '2-3 năm', 'Swift,Xcode,UIKit,CoreData', 'Hồ Chí Minh', 'phat@email.com'),
    ('T006', 'Lý Thị Quyên', 'Content Marketing', '1-2 năm', 'Copywriting,SEO,Social Media,Canva', 'Hà Nội', 'quyen@email.com');


-- ============================================================
-- SUMMARY
-- ============================================================
--  Tables  : 8
--  Users   : 14  (1 admin · 7 job seekers · 4 employers · 2 basic)
--  Categories: 16 (11 Vietnamese · 5 English admin panel)
--  Jobs    : 10  (full detail on jobs 1-3 · applicant counts on 7-10)
--  Applications: 6
--  Saved Jobs  : 4
--  Site Ratings: 4
--  Talent Pool : 6
-- ============================================================

-- ============================================================
-- MIGRATION: Add CV storage columns to users table
-- Run this if upgrading from an existing database
-- ============================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS cv_data LONGTEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cv_name VARCHAR(255) DEFAULT NULL;


-- ============================================================
-- MIGRATION: Add employer profile columns to users table
-- Run this if upgrading from an existing database
-- ============================================================
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS company_size VARCHAR(50) DEFAULT NULL;
