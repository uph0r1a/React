<?php
error_reporting(0);
ini_set("display_errors", "0");
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

define('DB_HOST', 'localhost');
define('DB_NAME', 'jobhot');
define('DB_USER', 'root');
define('DB_PASS', '');
define('MAIL_HOST', 'smtp.gmail.com');
define('MAIL_PORT', 587);
define('MAIL_USER', 'tri.td.2777@aptechlearning.edu.vn');
define('MAIL_PASS', 'kzez sufv tiet fypf');
define('MAIL_FROM', 'noreply@jobhot.vn');
define('MAIL_FROM_NAME', 'JobHot');
define('JWT_SECRET', 'JOBHOT_SECRET_KEY_2026_CHANGE_IN_PROD');
define('ADMIN_EMAIL', 'admin@jobhot.vn');
define('ADMIN_NAME', 'Quản trị viên JobHot');
define('VERIFICATION_TOKEN_EXPIRY', 1800);

function sendJsonResponse(bool $success, string $message, array $data = [], int $httpStatusCode = 200): void
{
    http_response_code($httpStatusCode);
    echo json_encode(['success' => $success, 'message' => $message, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function getDatabaseConnection(): PDO
{
    static $connection = null;

    if ($connection === null) {
        try {
            $socket = '/opt/lampp/var/mysql/mysql.sock';
            $dsn = file_exists($socket)
                ? 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4;unix_socket=' . $socket
                : 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $connection = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
        } catch (PDOException $error) {
            sendJsonResponse(false, 'Database error: ' . $error->getMessage(), [], 500);
        }
    }

    return $connection;
}

function createLoginToken(array $userInfo): string
{
    $headerEncoded = rtrim(base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT'])), '=');
    $bodyEncoded = rtrim(base64_encode(json_encode($userInfo)), '=');
    $signatureEncoded = rtrim(base64_encode(hash_hmac('sha256', "$headerEncoded.$bodyEncoded", JWT_SECRET, true)), '=');

    return "$headerEncoded.$bodyEncoded.$signatureEncoded";
}

function decodeTokenPayload(): ?array
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (!preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) return null;

    $tokenParts = explode('.', $matches[1]);
    if (count($tokenParts) !== 3) return null;

    $payloadJson = base64_decode(str_pad($tokenParts[1], strlen($tokenParts[1]) + (4 - strlen($tokenParts[1]) % 4) % 4, '='));
    $payload = json_decode($payloadJson, true);

    return $payload ?: null;
}

function getUserIdFromToken(): ?int
{
    $payload = decodeTokenPayload();
    return isset($payload['id']) ? (int)$payload['id'] : null;
}

function getUserRoleFromToken(): ?string
{
    $payload = decodeTokenPayload();
    return $payload['role'] ?? null;
}

function requireAdmin(): void
{
    if (getUserRoleFromToken() !== 'admin') sendJsonResponse(false, 'Bạn không có quyền truy cập.', [], 403);
}

function createVerificationToken(string $email): string
{
    return createLoginToken(['email' => $email, 'type' => 'password_reset', 'exp' => time() + VERIFICATION_TOKEN_EXPIRY, 'iat' => time()]);
}

function verifyPasswordResetToken(string $token): ?string
{
    try {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        $pad = (4 - strlen($parts[1]) % 4) % 4;
        $data = json_decode(base64_decode(str_pad($parts[1], strlen($parts[1]) + $pad, '=')), true);

        if (!$data || !isset($data['email'], $data['type'], $data['exp'])) return null;
        if ($data['type'] !== 'password_reset') return null;
        if ($data['exp'] < time()) return null;

        return $data['email'];
    } catch (Exception $e) {
        return null;
    }
}

function sendOtpByEmail(string $toEmail, string $otpCode): bool
{
    $phpMailerFolder = __DIR__ . '/PHPMailer/src/';

    if (file_exists($phpMailerFolder . 'PHPMailer.php')) {
        require_once $phpMailerFolder . 'Exception.php';
        require_once $phpMailerFolder . 'PHPMailer.php';
        require_once $phpMailerFolder . 'SMTP.php';

        $mailer = new PHPMailer\PHPMailer\PHPMailer(true);

        try {
            $mailer->isSMTP();
            $mailer->Host = MAIL_HOST;
            $mailer->SMTPAuth = true;
            $mailer->Username = MAIL_USER;
            $mailer->Password = MAIL_PASS;
            $mailer->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mailer->Port = MAIL_PORT;
            $mailer->CharSet = 'UTF-8';
            $mailer->setFrom(MAIL_FROM, MAIL_FROM_NAME);
            $mailer->addAddress($toEmail);
            $mailer->Subject = 'Mã xác nhận JobHot';
            $mailer->isHTML(true);
            $mailer->Body = "<div style='font-family:sans-serif'><h2 style='color:#7c3aed'>JobHot</h2><p>Mã OTP của bạn:</p><h1 style='letter-spacing:8px;color:#111'>$otpCode</h1><p style='color:#6b7280;font-size:13px'>Hiệu lực 5 phút. Không chia sẻ mã này.</p></div>";
            $mailer->send();

            return true;
        } catch (\Exception $error) {
            return false;
        }
    }

    return mail($toEmail, 'Mã xác nhận JobHot', 'Mã OTP của bạn: ' . $otpCode . ' (có hiệu lực 5 phút)', 'From: ' . MAIL_FROM);
}

function sendWelcomeEmail(string $toEmail, string $toName): bool
{
    $phpMailerFolder = __DIR__ . '/PHPMailer/src/';
    if (!file_exists($phpMailerFolder . 'PHPMailer.php')) return false;

    require_once $phpMailerFolder . 'Exception.php';
    require_once $phpMailerFolder . 'PHPMailer.php';
    require_once $phpMailerFolder . 'SMTP.php';

    $safeName = htmlspecialchars($toName, ENT_QUOTES, 'UTF-8');

    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = MAIL_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = MAIL_USER;
        $mail->Password = MAIL_PASS;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = MAIL_PORT;
        $mail->CharSet = 'UTF-8';
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($toEmail, $toName);
        $mail->Subject = 'Chào mừng bạn đến với JobHot! 🎉';
        $mail->isHTML(true);
        $mail->Body = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px'><h2 style='color:#7c3aed'>🐝 JobHot</h2><h3>Chào mừng, $safeName!</h3><p>Tài khoản của bạn đã được tạo thành công trên <strong>JobHot</strong>.</p><p>Bạn có thể bắt đầu tìm kiếm việc làm hoặc đăng tin tuyển dụng ngay bây giờ.</p><a href='https://jobhot.vn/login' style='display:inline-block;margin-top:16px;padding:12px 28px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold'>Đăng nhập ngay →</a><p style='margin-top:24px;color:#9ca3af;font-size:12px'>Nếu bạn không đăng ký tài khoản này, hãy bỏ qua email này.</p></div>";
        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}

$action = $_GET['action'] ?? '';

if ($action === 'get-jobs') {
    $keywordFilter = trim($_GET['keyword'] ?? '');
    $workTypeFilter = trim($_GET['workType'] ?? '');
    $levelFilter = trim($_GET['level'] ?? '');
    $locationFilter = trim($_GET['location'] ?? '');
    $categoryFilter = trim($_GET['category'] ?? '');

    $sql = "SELECT j.*, c.name as category_name, c.icon as category_icon FROM jobs j LEFT JOIN categories c ON c.id = j.category_id WHERE 1 = 1";
    $queryParams = [];

    if ($keywordFilter !== '') {
        $sql .= " AND (j.title LIKE ? OR j.company LIKE ?)";
        $queryParams[] = "%$keywordFilter%";
        $queryParams[] = "%$keywordFilter%";
    }
    if ($workTypeFilter !== '') {
        $sql .= " AND j.work_type = ?";
        $queryParams[] = $workTypeFilter;
    }
    if ($levelFilter !== '') {
        $sql .= " AND j.level = ?";
        $queryParams[] = $levelFilter;
    }
    if ($locationFilter !== '') {
        $sql .= " AND j.location LIKE ?";
        $queryParams[] = "%$locationFilter%";
    }
    if ($categoryFilter !== '') {
        $sql .= " AND c.name = ?";
        $queryParams[] = $categoryFilter;
    }

    $sql .= " ORDER BY j.created_at DESC";
    $statement = getDatabaseConnection()->prepare($sql);
    $statement->execute($queryParams);
    sendJsonResponse(true, 'Lấy danh sách việc làm thành công.', ['jobs' => $statement->fetchAll()]);
}

if ($action === 'get-stats') {
    $db = getDatabaseConnection();
    sendJsonResponse(true, 'Lấy thống kê thành công.', [
        'jobs' => (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'active'")->fetchColumn(),
        'companies' => (int)$db->query("SELECT COUNT(DISTINCT company) FROM jobs")->fetchColumn(),
        'candidates' => (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn(),
    ]);
}

if ($action === 'get-job') {
    $jobId = (int)($_GET['id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'ID công việc không hợp lệ.', [], 400);

    $db = getDatabaseConnection();
    $statement = $db->prepare("SELECT * FROM jobs WHERE id = ?");
    $statement->execute([$jobId]);
    $job = $statement->fetch();
    if (!$job) sendJsonResponse(false, 'Không tìm thấy công việc.', [], 404);

    $relatedStatement = $db->prepare("SELECT id, title, company, salary, location FROM jobs WHERE id != ? AND status = 'active' AND (category_id = ? OR location = ?) ORDER BY created_at DESC LIMIT 3");
    $relatedStatement->execute([$jobId, $job['category_id'], $job['location']]);
    $job['related_jobs'] = $relatedStatement->fetchAll();

    sendJsonResponse(true, 'Lấy chi tiết công việc thành công.', $job);
}

if ($action === 'get-users') {
    $userId = getUserIdFromToken();
    $userRole = getUserRoleFromToken();
    if (!$userId || $userRole !== 'admin') sendJsonResponse(false, 'Bạn không có quyền truy cập.', [], 403);

    $statement = getDatabaseConnection()->prepare("SELECT id, full_name, email, role, status, company, created_at FROM users ORDER BY created_at DESC");
    $statement->execute();
    sendJsonResponse(true, 'Lấy danh sách người dùng thành công.', $statement->fetchAll());
}

if ($action === 'get-employers') {
    $userId = getUserIdFromToken();
    $userRole = getUserRoleFromToken();
    if (!$userId || $userRole !== 'admin') sendJsonResponse(false, 'Bạn không có quyền truy cập.', [], 403);

    $statement = getDatabaseConnection()->prepare("SELECT id, full_name, email, company, status, created_at FROM users WHERE role = 'employer' ORDER BY created_at DESC");
    $statement->execute();
    sendJsonResponse(true, 'Lấy danh sách nhà tuyển dụng thành công.', $statement->fetchAll());
}

if ($action === 'get-categories') {
    try {
        $statement = getDatabaseConnection()->prepare("SELECT c.id, c.name, c.icon, COUNT(j.id) as count FROM categories c LEFT JOIN jobs j ON j.category_id = c.id AND j.status = 'active' GROUP BY c.id, c.name, c.icon ORDER BY c.name ASC");
        $statement->execute();
        $categories = array_map(fn($row) => ['label' => $row['name'], 'icon' => $row['icon'], 'count' => (int)$row['count']], $statement->fetchAll());

        if (empty($categories)) {
            $categories = [
                ['label' => 'Công nghệ thông tin', 'icon' => '💻', 'count' => 0],
                ['label' => 'Marketing / PR', 'icon' => '📢', 'count' => 0],
                ['label' => 'Thiết kế', 'icon' => '🎨', 'count' => 0],
                ['label' => 'Kế toán / Kiểm toán', 'icon' => '📊', 'count' => 0],
            ];
        }

        sendJsonResponse(true, 'Lấy danh sách danh mục thành công.', ['categories' => $categories]);
    } catch (Exception $e) {
        sendJsonResponse(false, 'Lỗi khi lấy danh mục: ' . $e->getMessage(), [], 500);
    }
}

if ($action === 'admin-get-stats') {
    requireAdmin();
    $db = getDatabaseConnection();
    sendJsonResponse(true, 'OK', [
        'totalJobs' => (int)$db->query("SELECT COUNT(*) FROM jobs")->fetchColumn(),
        'activeJobs' => (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'active'")->fetchColumn(),
        'pendingJobs' => (int)$db->query("SELECT COUNT(*) FROM jobs WHERE status = 'pending'")->fetchColumn(),
        'totalUsers' => (int)$db->query("SELECT COUNT(*) FROM users WHERE role != 'admin'")->fetchColumn(),
        'totalEmployers' => (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'employer'")->fetchColumn(),
        'totalSeekers' => (int)$db->query("SELECT COUNT(*) FROM users WHERE role = 'user'")->fetchColumn(),
        'totalCategories' => (int)$db->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
        'totalApplications' => (int)$db->query("SELECT COUNT(*) FROM applications")->fetchColumn(),
        'categoryStats' => $db->query("SELECT c.name, c.icon, COUNT(j.id) as job_count FROM categories c LEFT JOIN jobs j ON j.category_id = c.id GROUP BY c.id, c.name, c.icon ORDER BY job_count DESC")->fetchAll(),
    ]);
}

if ($action === 'admin-get-users') {
    requireAdmin();
    $users = getDatabaseConnection()->query("SELECT id, full_name, email, role, status, company, position, created_at FROM users WHERE role != 'admin' ORDER BY created_at DESC")->fetchAll();
    sendJsonResponse(true, 'OK', ['users' => $users]);
}

if ($action === 'admin-get-jobs') {
    requireAdmin();
    $jobs = getDatabaseConnection()->query("SELECT j.id, j.title, j.company, j.location, j.work_type, j.level, j.salary, j.status, j.created_at, j.deadline, j.applicants, c.name AS category_name, c.icon AS category_icon FROM jobs j LEFT JOIN categories c ON c.id = j.category_id ORDER BY j.created_at DESC")->fetchAll();
    sendJsonResponse(true, 'OK', ['jobs' => $jobs]);
}

if ($action === 'admin-get-categories') {
    requireAdmin();
    sendJsonResponse(true, 'OK', ['categories' => getDatabaseConnection()->query("SELECT * FROM categories ORDER BY id ASC")->fetchAll()]);
}

if ($action === 'get-saved-jobs') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $stmt = getDatabaseConnection()->prepare("SELECT s.id, s.job_id, s.saved_at, j.title, j.company, j.location, j.salary, j.work_type, j.level, j.logo, j.deadline FROM saved_jobs s JOIN jobs j ON j.id = s.job_id WHERE s.user_id = ? ORDER BY s.saved_at DESC");
    $stmt->execute([$uid]);

    $jobs = array_map(function ($row) {
        $row['daysLeft'] = $row['deadline'] ? max(0, (int)((strtotime($row['deadline']) - time()) / 86400)) : 0;
        $row['id'] = $row['job_id'];
        return $row;
    }, $stmt->fetchAll());

    sendJsonResponse(true, 'OK', ['jobs' => $jobs]);
}

if ($action === 'get-applied-jobs') {
    $userId = getUserIdFromToken();
    if (!$userId) sendJsonResponse(false, 'Ban can dang nhap.', [], 401);

    $stmt = getDatabaseConnection()->prepare("SELECT a.id, a.job_id, a.status, a.applied_at, j.title, j.company, j.location, j.salary, j.logo FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.user_id = ? ORDER BY a.applied_at DESC");
    $stmt->execute([$userId]);
    sendJsonResponse(true, 'Lay danh sach ung tuyen thanh cong.', $stmt->fetchAll());
}

if ($action === 'get-user-profile') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $stmt = getDatabaseConnection()->prepare("SELECT id, full_name, email, phone, dob, gender, address, position, experience, skills, industry, bio, education, avatar, cv_name FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) sendJsonResponse(false, 'Không tìm thấy thông tin người dùng.', [], 404);

    sendJsonResponse(true, 'Lấy thông tin người dùng thành công.', $user);
}

if ($action === 'get-employer-profile') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $stmt = getDatabaseConnection()->prepare("SELECT full_name, email, company, industry, phone, address, bio, website, company_size FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) sendJsonResponse(false, 'Không tìm thấy thông tin.', [], 404);

    sendJsonResponse(true, 'Lấy thông tin công ty thành công.', $user);
}

if ($action === 'get-jobs-by-industry') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $db = getDatabaseConnection();
    $userStmt = $db->prepare("SELECT industry FROM users WHERE id = ? LIMIT 1");
    $userStmt->execute([$uid]);
    $user = $userStmt->fetch();

    $categoryId = null;
    if ($user && $user['industry']) {
        $catStmt = $db->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
        $catStmt->execute([$user['industry']]);
        $category = $catStmt->fetch();
        $categoryId = $category['id'] ?? null;
    }

    $sql = "SELECT j.*, c.name as category_name, c.icon as category_icon FROM jobs j LEFT JOIN categories c ON c.id = j.category_id WHERE j.status = 'active'" . ($categoryId ? " AND j.category_id = ?" : "") . " ORDER BY j.created_at DESC";
    $jobsStmt = $db->prepare($sql);
    $jobsStmt->execute($categoryId ? [$categoryId] : []);

    sendJsonResponse(true, 'Lấy danh sách việc làm thành công.', ['jobs' => $jobsStmt->fetchAll(), 'industry' => $user['industry'] ?? null]);
}

if ($action === 'check-job-status') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $jobId = (int)($_GET['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    $db = getDatabaseConnection();
    $appliedStmt = $db->prepare("SELECT id FROM applications WHERE job_id = ? AND user_id = ? LIMIT 1");
    $appliedStmt->execute([$jobId, $uid]);
    $savedStmt = $db->prepare("SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ? LIMIT 1");
    $savedStmt->execute([$jobId, $uid]);

    sendJsonResponse(true, 'OK', ['applied' => $appliedStmt->fetch() !== false, 'saved' => $savedStmt->fetch() !== false]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJsonResponse(false, 'Chi ho tro POST.', [], 405);

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) sendJsonResponse(false, 'Body JSON không hợp lệ.', [], 400);

if ($action === 'update-employer-profile') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $company = trim($body['company'] ?? '');
    $email = trim($body['email'] ?? '');
    $phone = trim($body['phone'] ?? '');
    $address = trim($body['address'] ?? '');
    $website = trim($body['website'] ?? '');
    $size = trim($body['company_size'] ?? '');
    $industry = trim($body['industry'] ?? '');
    $bio = trim($body['bio'] ?? '');

    if ($company === '') sendJsonResponse(false, 'Tên công ty không được để trống.', [], 400);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);

    getDatabaseConnection()->prepare("UPDATE users SET company = ?, email = ?, phone = ?, address = ?, website = ?, company_size = ?, industry = ?, bio = ? WHERE id = ?")
        ->execute([$company, $email, $phone, $address, $website, $size, $industry, $bio, $uid]);

    sendJsonResponse(true, 'Cập nhật thông tin công ty thành công.');
}

if ($action === 'login') {
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    if ($email === '' || $password === '') sendJsonResponse(false, 'Vui lòng nhập đủ thông tin.', [], 400);

    $query = getDatabaseConnection()->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
    $query->execute([$email]);
    $user = $query->fetch();

    if (!$user || !password_verify($password, $user['password'])) sendJsonResponse(false, 'Email hoặc mật khẩu không đúng.', [], 401);
    if ($user['status'] === 'suspended') sendJsonResponse(false, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', [], 403);

    $token = createLoginToken(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'name' => $user['full_name'], 'exp' => time() + 604800]);

    sendJsonResponse(true, 'Đăng nhập thành công.', [
        'token' => $token,
        'role' => $user['role'],
        'name' => $user['full_name'],
        'email' => $user['email'],
        'industry' => $user['industry'],
        'company' => $user['company'] ?? null,
        'avatar' => $user['avatar'] ?? null,
    ]);
}

if ($action === 'register') {
    $fullName = trim($body['fullName'] ?? '');
    $email = trim($body['email'] ?? '');
    $password = $body['password'] ?? '';
    $industry = trim($body['industry'] ?? '');
    $requestedRole = $body['role'] ?? '';
    $role = in_array($requestedRole, ['user', 'employer'], true) ? $requestedRole : 'user';

    if ($fullName === '' || $email === '' || $password === '') sendJsonResponse(false, 'Thiếu thông tin bắt buộc.', [], 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);
    if (strlen($password) < 8) sendJsonResponse(false, 'Mật khẩu tối thiểu 8 ký tự.', [], 400);

    $db = getDatabaseConnection();
    $checkEmail = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkEmail->execute([$email]);
    if ($checkEmail->fetch()) sendJsonResponse(false, 'Email này đã được sử dụng.', [], 409);

    $avatar = $body['avatar'] ?? null;
    if ($avatar && strlen($avatar) > 2800000) $avatar = null;
    $company = trim($body['company'] ?? '');

    $db->prepare("INSERT INTO users (full_name, email, password, role, industry, company, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)")
        ->execute([$fullName, $email, password_hash($password, PASSWORD_DEFAULT), $role, $industry ?: null, $company ?: null, $avatar]);

    sendWelcomeEmail($email, $fullName);

    sendJsonResponse(true, 'Đăng ký thành công.', ['role' => $role]);
}

if ($action === 'forgot-password') {
    $email = trim($body['email'] ?? '');
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);

    $db = getDatabaseConnection();
    $checkUser = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $checkUser->execute([$email]);
    if (!$checkUser->fetch()) sendJsonResponse(true, 'Nếu email tồn tại, mã OTP đã được gửi.');

    $otpCode = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = gmdate('Y-m-d H:i:s', time() + 300);

    try {
        $db->beginTransaction();
        $db->prepare("UPDATE otp_tokens SET used = 1 WHERE email = ? AND used = 0")->execute([$email]);
        $db->prepare("INSERT INTO otp_tokens (email, otp, expires_at) VALUES (?, ?, ?)")->execute([$email, $otpCode, $expiresAt]);

        if (!sendOtpByEmail($email, $otpCode)) {
            $db->rollBack();
            sendJsonResponse(false, 'Không thể gửi email. Thử lại sau.', [], 500);
        }

        $db->commit();
        sendJsonResponse(true, 'Mã OTP đã được gửi đến email của bạn.');
    } catch (Exception $e) {
        $db->rollBack();
        sendJsonResponse(false, 'Có lỗi xảy ra. Vui lòng thử lại.', [], 500);
    }
}

if ($action === 'verify-otp') {
    $email = trim($body['email'] ?? '');
    $otpCode = trim($body['otp'] ?? '');
    if ($email === '' || $otpCode === '') sendJsonResponse(false, 'Thiếu thông tin.', [], 400);

    $db = getDatabaseConnection();
    $findOtp = $db->prepare("SELECT id FROM otp_tokens WHERE email = ? AND otp = ? AND used = 0 AND expires_at > UTC_TIMESTAMP() ORDER BY created_at DESC LIMIT 1");
    $findOtp->execute([$email, $otpCode]);
    $otpRow = $findOtp->fetch();
    if (!$otpRow) sendJsonResponse(false, 'Mã OTP không đúng hoặc đã hết hạn.', [], 400);

    $db->prepare("UPDATE otp_tokens SET used = 1 WHERE id = ?")->execute([$otpRow['id']]);

    sendJsonResponse(true, 'Xác minh OTP thành công.', ['verificationToken' => createVerificationToken($email)]);
}

if ($action === 'reset-password') {
    $email = trim($body['email'] ?? '');
    $newPassword = $body['password'] ?? '';
    $verificationToken = trim($body['verificationToken'] ?? '');

    if ($email === '' || $newPassword === '' || $verificationToken === '') sendJsonResponse(false, 'Thiếu thông tin.', [], 400);
    if (strlen($newPassword) < 8) sendJsonResponse(false, 'Mật khẩu tối thiểu 8 ký tự.', [], 400);

    $tokenEmail = verifyPasswordResetToken($verificationToken);
    if ($tokenEmail === null) sendJsonResponse(false, 'Mã xác minh không hợp lệ hoặc đã hết hạn.', [], 401);
    if ($tokenEmail !== $email) sendJsonResponse(false, 'Email không khớp với mã xác minh.', [], 401);

    $updatePassword = getDatabaseConnection()->prepare("UPDATE users SET password = ? WHERE email = ?");
    $updatePassword->execute([password_hash($newPassword, PASSWORD_DEFAULT), $email]);
    if ($updatePassword->rowCount() === 0) sendJsonResponse(false, 'Không tìm thấy tài khoản.', [], 404);

    sendJsonResponse(true, 'Đặt lại mật khẩu thành công.');
}

if ($action === 'contact') {
    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $message = trim($body['message'] ?? '');

    if (!$name || !$email || !$message) sendJsonResponse(false, 'Vui lòng điền đầy đủ thông tin.', [], 400);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);

    $phpMailerFolder = __DIR__ . '/PHPMailer/src/';
    if (file_exists($phpMailerFolder . 'PHPMailer.php')) {
        require_once $phpMailerFolder . 'Exception.php';
        require_once $phpMailerFolder . 'PHPMailer.php';
        require_once $phpMailerFolder . 'SMTP.php';

        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = MAIL_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = MAIL_USER;
            $mail->Password = MAIL_PASS;
            $mail->SMTPSecure = 'tls';
            $mail->Port = MAIL_PORT;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
            $mail->addAddress(ADMIN_EMAIL, ADMIN_NAME);
            $mail->addReplyTo($email, $name);
            $mail->Subject = "[JobHot] Phản hồi từ: $name";
            $mail->Body = "Tên: $name\nEmail: $email\n\nNội dung:\n$message";
            $mail->send();
        } catch (Exception $e) {
        }
    }

    sendJsonResponse(true, 'Phản hồi của bạn đã được gửi thành công.');
}

if ($action === 'apply-job') {
    $userId = getUserIdFromToken();
    if (!$userId) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $jobId = (int)($body['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    $db = getDatabaseConnection();
    $checkJob = $db->prepare("SELECT id FROM jobs WHERE id = ? LIMIT 1");
    $checkJob->execute([$jobId]);
    if (!$checkJob->fetch()) sendJsonResponse(false, 'Việc làm không tồn tại.', [], 404);

    $checkDup = $db->prepare("SELECT id FROM applications WHERE job_id = ? AND user_id = ? LIMIT 1");
    $checkDup->execute([$jobId, $userId]);
    if ($checkDup->fetch()) sendJsonResponse(false, 'Bạn đã ứng tuyển vị trí này rồi.', [], 409);

    $db->prepare("INSERT INTO applications (job_id, user_id, status) VALUES (?, ?, 'new')")->execute([$jobId, $userId]);
    sendJsonResponse(true, 'Ứng tuyển thành công.');
}

if ($action === 'send-confirm-email') {
    $toEmail = trim($body['email'] ?? '');
    $toName = trim($body['name'] ?? '');

    if (!$toEmail || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);

    $phpMailerFolder = __DIR__ . '/PHPMailer/src/';
    if (file_exists($phpMailerFolder . 'PHPMailer.php')) {
        if (!sendWelcomeEmail($toEmail, $toName)) sendJsonResponse(false, 'Không thể gửi email xác nhận.', [], 500);
    } elseif (!mail($toEmail, 'Chào mừng bạn đến với JobHot! 🎉', 'Chào mừng, ' . htmlspecialchars($toName, ENT_QUOTES, 'UTF-8') . '! Tài khoản của bạn đã được tạo thành công.', 'From: ' . MAIL_FROM)) {
        sendJsonResponse(false, 'Không thể gửi email xác nhận.', [], 500);
    }

    sendJsonResponse(true, 'Email xác nhận đã được gửi.');
}

if ($action === 'save-job') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $jobId = (int)($body['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    try {
        getDatabaseConnection()->prepare("INSERT IGNORE INTO saved_jobs (job_id, user_id) VALUES (?, ?)")->execute([$jobId, $uid]);
        sendJsonResponse(true, 'Đã lưu việc làm.');
    } catch (Exception $e) {
        sendJsonResponse(false, 'Lỗi.', [], 500);
    }
}

if ($action === 'unsave-job') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $jobId = (int)($body['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    getDatabaseConnection()->prepare("DELETE FROM saved_jobs WHERE job_id = ? AND user_id = ?")->execute([$jobId, $uid]);
    sendJsonResponse(true, 'Đã bỏ lưu.');
}

if ($action === 'approve-job') {
    if (getUserRoleFromToken() !== 'admin') sendJsonResponse(false, 'Bạn không có quyền thực hiện thao tác này.', [], 403);

    $jobId = (int)($body['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    $stmt = getDatabaseConnection()->prepare("UPDATE jobs SET status = 'active' WHERE id = ?");
    $stmt->execute([$jobId]);

    $stmt->rowCount() > 0
        ? sendJsonResponse(true, 'Đã duyệt tin tuyển dụng.')
        : sendJsonResponse(false, 'Không tìm thấy tin tuyển dụng.', [], 404);
}

if ($action === 'delete-job') {
    if (getUserRoleFromToken() !== 'admin') sendJsonResponse(false, 'Bạn không có quyền thực hiện thao tác này.', [], 403);

    $jobId = (int)($body['job_id'] ?? 0);
    if (!$jobId) sendJsonResponse(false, 'Thiếu job_id.', [], 400);

    $stmt = getDatabaseConnection()->prepare("DELETE FROM jobs WHERE id = ?");
    $stmt->execute([$jobId]);

    $stmt->rowCount() > 0
        ? sendJsonResponse(true, 'Đã xóa tin tuyển dụng.')
        : sendJsonResponse(false, 'Không tìm thấy tin tuyển dụng.', [], 404);
}

if ($action === 'submit-rating') {
    $rating = (int)($body['rating'] ?? 0);
    $comment = trim($body['comment'] ?? '');
    if ($rating < 1 || $rating > 5) sendJsonResponse(false, 'Điểm đánh giá phải từ 1 đến 5.', [], 400);

    getDatabaseConnection()->prepare("INSERT INTO site_ratings (rating, comment, ip) VALUES (?, ?, ?)")->execute([$rating, $comment ?: null, $_SERVER['REMOTE_ADDR'] ?? null]);
    sendJsonResponse(true, 'Cảm ơn bạn đã đánh giá!');
}

if ($action === 'update-profile') {
    $uid = getUserIdFromToken();
    if (!$uid) sendJsonResponse(false, 'Bạn cần đăng nhập.', [], 401);

    $name = trim($body['name'] ?? '');
    $email = trim($body['email'] ?? '');
    $avatar = $body['avatar'] ?? null;
    $cvBase64 = $body['cv'] ?? null;

    if ($name === '') sendJsonResponse(false, 'Họ và tên không được để trống.', [], 400);
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) sendJsonResponse(false, 'Email không hợp lệ.', [], 400);
    if ($avatar && strlen($avatar) > 2800000) $avatar = null;

    $db = getDatabaseConnection();

    if ($email !== '') {
        $dup = $db->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
        $dup->execute([$email, $uid]);
        if ($dup->fetch()) sendJsonResponse(false, 'Email này đã được sử dụng bởi tài khoản khác.', [], 409);
    }

    $fields = [
        'full_name' => $name,
        'phone' => trim($body['phone'] ?? '') ?: null,
        'dob' => trim($body['dob'] ?? '') ?: null,
        'gender' => trim($body['gender'] ?? '') ?: null,
        'address' => trim($body['address'] ?? '') ?: null,
        'position' => trim($body['position'] ?? '') ?: null,
        'experience' => trim($body['experience'] ?? '') ?: null,
        'skills' => trim($body['skills'] ?? '') ?: null,
        'industry' => trim($body['industry'] ?? '') ?: null,
        'bio' => trim($body['bio'] ?? '') ?: null,
    ];

    if ($email !== '') $fields['email'] = $email;
    if ($avatar !== null) $fields['avatar'] = $avatar;

    if ($cvBase64 !== null && strlen($cvBase64) <= 14000000) {
        $fields['cv_data'] = $cvBase64;
        $fields['cv_name'] = trim($body['cvName'] ?? '') ?: 'cv.pdf';
    }

    $values = array_values($fields);
    $values[] = $uid;
    $db->prepare("UPDATE users SET " . implode(', ', array_map(fn($k) => "$k = ?", array_keys($fields))) . " WHERE id = ?")->execute($values);

    $fresh = $db->prepare("SELECT full_name, email, avatar, industry, position, cv_name FROM users WHERE id = ? LIMIT 1");
    $fresh->execute([$uid]);
    $user = $fresh->fetch();

    sendJsonResponse(true, 'Cập nhật thông tin thành công.', [
        'name' => $user['full_name'],
        'email' => $user['email'],
        'avatar' => $user['avatar'] ?? null,
        'industry' => $user['industry'] ?? null,
        'position' => $user['position'] ?? null,
        'cv_name' => $user['cv_name'] ?? null,
    ]);
}

if ($action === 'admin-update-user') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    if (!$id) sendJsonResponse(false, 'Thiếu user id.', [], 400);

    $fields = [];
    $values = [];
    foreach (['full_name', 'email', 'status', 'role'] as $col) {
        if (isset($body[$col])) {
            $fields[] = "$col = ?";
            $values[] = $body[$col];
        }
    }
    if (empty($fields)) sendJsonResponse(false, 'Không có dữ liệu cập nhật.', [], 400);

    $values[] = $id;
    getDatabaseConnection()->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? AND role != 'admin'")->execute($values);
    sendJsonResponse(true, 'Cập nhật người dùng thành công.');
}

if ($action === 'admin-delete-user') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    if (!$id) sendJsonResponse(false, 'Thiếu user id.', [], 400);

    getDatabaseConnection()->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'")->execute([$id]);
    sendJsonResponse(true, 'Đã xóa người dùng.');
}

if ($action === 'admin-update-job') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    if (!$id) sendJsonResponse(false, 'Thiếu job id.', [], 400);

    $fields = [];
    $values = [];
    foreach (['status', 'title', 'company', 'location', 'salary'] as $col) {
        if (isset($body[$col])) {
            $fields[] = "$col = ?";
            $values[] = $body[$col];
        }
    }
    if (empty($fields)) sendJsonResponse(false, 'Không có dữ liệu cập nhật.', [], 400);

    $values[] = $id;
    getDatabaseConnection()->prepare("UPDATE jobs SET " . implode(', ', $fields) . " WHERE id = ?")->execute($values);
    sendJsonResponse(true, 'Cập nhật bài đăng thành công.');
}

if ($action === 'admin-delete-job') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    if (!$id) sendJsonResponse(false, 'Thiếu job id.', [], 400);

    getDatabaseConnection()->prepare("DELETE FROM jobs WHERE id = ?")->execute([$id]);
    sendJsonResponse(true, 'Đã xóa bài đăng.');
}

if ($action === 'admin-add-category') {
    requireAdmin();
    $name = trim($body['name'] ?? '');
    $icon = trim($body['icon'] ?? '📂');
    if ($name === '') sendJsonResponse(false, 'Tên danh mục không được để trống.', [], 400);

    $db = getDatabaseConnection();
    try {
        $db->prepare("INSERT INTO categories (name, icon) VALUES (?, ?)")->execute([$name, $icon]);
        sendJsonResponse(true, 'Thêm danh mục thành công.', ['id' => $db->lastInsertId()]);
    } catch (\PDOException $e) {
        sendJsonResponse(false, 'Danh mục đã tồn tại.', [], 409);
    }
}

if ($action === 'admin-update-category') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    $name = trim($body['name'] ?? '');
    $icon = trim($body['icon'] ?? '');
    if (!$id || $name === '') sendJsonResponse(false, 'Thiếu dữ liệu.', [], 400);

    getDatabaseConnection()->prepare("UPDATE categories SET name = ?, icon = ? WHERE id = ?")->execute([$name, $icon, $id]);
    sendJsonResponse(true, 'Cập nhật danh mục thành công.');
}

if ($action === 'admin-delete-category') {
    requireAdmin();
    $id = (int)($body['id'] ?? 0);
    if (!$id) sendJsonResponse(false, 'Thiếu id.', [], 400);

    $db = getDatabaseConnection();
    $db->prepare("UPDATE jobs SET category_id = NULL WHERE category_id = ?")->execute([$id]);
    $db->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    sendJsonResponse(true, 'Đã xóa danh mục.');
}

sendJsonResponse(false, "Action '$action' không tồn tại.", [], 404);
