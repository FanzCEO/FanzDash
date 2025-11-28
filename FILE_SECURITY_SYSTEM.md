# File Security & Virus Scanning System

## Overview

The fanzdash platform now includes a **comprehensive, multi-layered file security system** that automatically scans all uploaded files for viruses, malware, phishing attempts, and other security threats. This system protects the platform and users from malicious file uploads across all upload endpoints.

## Features

### 1. **Multi-Engine Scanning**
- **ClamAV Integration**: Local antivirus scanning using ClamAV (open-source)
- **VirusTotal API**: Cloud-based scanning with 70+ antivirus engines
- **Signature Analysis**: Custom pattern matching for malicious code signatures
- **Code Analysis**: Static analysis of executable code files (JS, PHP, Python, etc.)
- **Phishing Detection**: Pattern matching for phishing content

### 2. **Threat Detection**
The system detects:
- **Viruses & Malware**: Traditional file-based threats
- **Code Injection**: SQL injection, XSS, remote code execution patterns
- **Obfuscated Code**: Base64 encoding, JavaScript/PHP obfuscation
- **Phishing Content**: PayPal scams, account suspension attempts, crypto scams
- **Crypto Miners**: Coinhive, WebMiner detection
- **Suspicious URLs**: IP-based URLs, shortened links, suspicious TLDs
- **Shell Scripts**: Backdoors, reverse shells, system command execution

### 3. **Automatic Quarantine**
- Infected files are automatically moved to quarantine
- Read-only permissions prevent accidental execution
- Metadata preserved for forensic analysis
- Admin-only access to quarantine management

### 4. **Comprehensive Logging**
- All scans logged with timestamps
- User tracking (who uploaded, from which IP)
- Threat details preserved
- Scan engine results tracked
- Export to JSON/CSV for compliance

### 5. **Admin Dashboard**
- Real-time statistics (total scans, clean, infected, suspicious)
- Scan history viewer
- Quarantine management
- Threat timeline (last 7 days)
- Top threats report
- Export functionality

## Architecture

```
Upload Request
     ↓
[MIME Type Validation]
     ↓
[File Size Check]
     ↓
[Virus Scanning Middleware] ← Main Security Layer
     ↓
├─ ClamAV Scan (local)
├─ Signature Analysis (patterns)
├─ Code Analysis (static)
└─ VirusTotal (async, for suspicious files)
     ↓
[Result Evaluation]
     ↓
├─ Clean → Continue to storage
├─ Suspicious → Log warning, continue
├─ Infected → Quarantine, reject upload
└─ Quarantined → Block access, alert admin
```

## Integration Points

The virus scanning middleware is integrated into **ALL** upload endpoints:

### 1. **CRM Module** (`/api/crm/*`)
- Lead document uploads
- Client file uploads
- Proposal uploads
- Contact document uploads
- CSV imports

### 2. **HR Module** (`/api/hr/*`)
- Employee document uploads (resumes, contracts, certifications)
- Job application uploads
- Payroll file uploads
- Training material uploads

### 3. **ERP Module** (`/api/erp/*`)
- Budget CSV imports
- Project document uploads
- Purchase order document uploads
- Invoice uploads

### 4. **ADA Accommodation** (`/api/ada-accommodation/*`)
- Medical documentation uploads (HIPAA protected)
- Supporting document uploads

### 5. **Plugin Management** (`/api/plugins/*`)
- Custom plugin uploads (.zip, .js, .ts)
- **CRITICAL**: Plugins are executable code - thoroughly scanned

### 6. **Media Uploads** (`/api/media/*`)
- Standard media uploads (images, videos, audio)
- Chunked upload pipeline (5MB chunks)

### 7. **Media Protection** (`/api/protection/*`)
- Chunked media uploads
- Each chunk is scanned individually

## File Types Scanned

### Documents
- PDF, DOC, DOCX
- XLS, XLSX, CSV
- TXT, JSON

### Media
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, AVI, MOV, WebM
- Audio: MP3, WAV, AAC, OGG

### Code Files
- JavaScript: .js, .jsx
- TypeScript: .ts, .tsx
- PHP: .php
- Python: .py
- Shell: .sh, .bash
- Archives: .zip, .tar.gz

## ClamAV Setup

### Installation

**macOS:**
```bash
brew install clamav
brew services start clamav
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install clamav clamav-daemon
sudo freshclam  # Update virus definitions
sudo systemctl start clamav-daemon
```

**Docker:**
```bash
docker run -d --name clamav \
  -p 3310:3310 \
  clamav/clamav:latest
```

### Configuration

The system will automatically use:
1. `clamdscan` (if ClamAV daemon is running) - **FASTER**
2. `clamscan` (if only CLI is available) - slower

Update virus definitions regularly:
```bash
sudo freshclam
```

## VirusTotal API (Optional)

For enhanced cloud-based scanning:

1. Get API key from: https://www.virustotal.com/gui/join-us
2. Set environment variable:
```bash
export VIRUSTOTAL_API_KEY=your_api_key_here
```

**Note**: Free tier has rate limits (4 requests/minute)

## Environment Variables

```bash
# Optional: Custom quarantine directory
QUARANTINE_DIR=/path/to/quarantine

# Optional: VirusTotal API key
VIRUSTOTAL_API_KEY=your_key_here

# Optional: Document storage path
DOCUMENT_STORAGE_PATH=/path/to/documents
```

## API Endpoints

### Statistics
```http
GET /api/file-security/statistics
```
Returns scan statistics (total scans, clean, infected, etc.)

### Scan Logs
```http
GET /api/file-security/logs?status=infected&limit=100&offset=0
```
Query parameters:
- `status`: Filter by scan status (clean, infected, suspicious, quarantined, error)
- `uploadedBy`: Filter by user ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Number of results (default: 100)
- `offset`: Pagination offset

### Quarantine List
```http
GET /api/file-security/quarantine
```
Returns list of quarantined files

### Quarantine Details
```http
GET /api/file-security/quarantine/:fileHash
```
Get details of specific quarantined file

### Delete Quarantined File
```http
DELETE /api/file-security/quarantine/:fileHash
```
Permanently delete quarantined file (super admin only)

### Release from Quarantine
```http
POST /api/file-security/quarantine/:fileHash/release
Body: { "destinationPath": "/path/to/restore", "fileName": "file.pdf" }
```
Release file from quarantine (super admin only - USE WITH EXTREME CAUTION)

### Threat Summary
```http
GET /api/file-security/threats/summary
```
Returns dashboard data: statistics, recent threats, top threats, timeline

### Export Logs
```http
GET /api/file-security/export?format=json
GET /api/file-security/export?format=csv
```
Export scan logs for compliance/audit

### Manual Scan
```http
POST /api/file-security/scan
Body: { "filePath": "/path/to/file" }
```
Manually scan a file (admin only)

## Usage Examples

### Backend: Using the Secure Upload Middleware

```typescript
import { createSecureUploadMiddleware } from '../middleware/fileScanningMiddleware';
import multer from 'multer';

// Create secure upload instance
const upload = createSecureUploadMiddleware({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Your file type validation
    cb(null, true);
  }
});

// Use in routes (replaces standard multer)
router.post('/upload', ...upload.single('file'), async (req, res) => {
  // File has been scanned before reaching here
  // Check for scan warnings
  if (req.fileScanResults) {
    console.log('Scan results:', req.fileScanResults);
  }

  // Your upload logic
});
```

### Backend: Direct Buffer Scanning

```typescript
import { scanFileBuffer } from '../middleware/fileScanningMiddleware';

const fileBuffer = Buffer.from(...);
const scanResult = await scanFileBuffer(fileBuffer, 'document.pdf', {
  mimeType: 'application/pdf',
  uploadedBy: userId,
  ipAddress: req.ip
});

if (scanResult.status === 'infected' || scanResult.status === 'quarantined') {
  throw new Error(`File contains threats: ${scanResult.threats.join(', ')}`);
}
```

### Frontend: Handling Upload Errors

```typescript
try {
  const response = await apiRequest('/api/upload', {
    method: 'POST',
    body: formData
  });
} catch (error) {
  if (error.response?.data?.threats) {
    // File was blocked due to security threats
    console.error('Threats detected:', error.response.data.threats);
  }
}
```

## Security Best Practices

### 1. **Keep ClamAV Updated**
```bash
# Update daily via cron
0 2 * * * /usr/bin/freshclam --quiet
```

### 2. **Monitor Quarantine**
Regularly review quarantined files in the admin dashboard

### 3. **Review Suspicious Files**
Files marked as "suspicious" are allowed but logged - review these periodically

### 4. **Export Logs Regularly**
Export scan logs monthly for compliance/audit purposes

### 5. **Test Scanning**
Use EICAR test file to verify scanning works:
```bash
# Download EICAR test file
wget https://secure.eicar.org/eicar.com
# Try uploading - should be blocked
```

### 6. **Never Release Quarantined Files Without Verification**
Only super admins can release files from quarantine. Verify the file is safe before releasing.

### 7. **Set Up Alerts**
Configure alerts for:
- Multiple infected files from same user
- Repeated upload attempts after rejection
- Quarantine directory size limits

## Performance Considerations

### Scan Times
- **Small files (<1MB)**: 50-200ms
- **Medium files (1-10MB)**: 200ms-1s
- **Large files (10-50MB)**: 1-5s
- **Chunked uploads**: Scanned per chunk (5MB), parallel processing

### Optimization Tips
1. Use ClamAV daemon (`clamd`) instead of CLI for 10x faster scans
2. VirusTotal scans are async - don't block on them
3. Chunked uploads scan in parallel (4 chunks at a time)
4. Signature analysis runs concurrently with ClamAV

## Troubleshooting

### ClamAV Not Found
```
Error: ClamAV scan failed: Command failed: clamscan
```

**Solution**: Install ClamAV or the system will continue with signature/code analysis only.

### Quarantine Permission Denied
```
Error: Failed to quarantine file: EACCES
```

**Solution**: Ensure the quarantine directory has proper permissions:
```bash
mkdir -p /path/to/quarantine
chmod 700 /path/to/quarantine
```

### VirusTotal Rate Limit
```
Warning: VirusTotal scan failed: 429 Too Many Requests
```

**Solution**: VirusTotal free tier is limited. Only suspicious files are sent to VT. Consider upgrading or reducing scanning frequency.

### False Positives
Some legitimate files may be flagged as suspicious due to:
- Legitimate obfuscation (minified JavaScript)
- Legitimate cryptography libraries
- Generic heuristic patterns

**Solution**: Review in admin dashboard and whitelist if confirmed safe.

## Compliance & Audit

### HIPAA Compliance (ADA Module)
- Medical documents are scanned before encryption
- Scan logs maintain audit trail
- Quarantine preserves evidence

### PCI DSS Compliance
- Payment-related documents scanned
- Infected files never reach storage
- Export logs for audits

### GDPR Compliance
- User data in scan logs (uploaded by, IP)
- Logs automatically limited to 10,000 entries
- Export for data subject access requests

## Dashboard Access

The File Security Dashboard is available at:
```
/file-security-dashboard
```

**Access Requirements:**
- Admin or Super Admin role
- Authentication required

## Monitoring & Alerts

### Key Metrics to Monitor
1. **Infection Rate**: infected files / total scans
2. **Quarantine Growth**: number of files in quarantine
3. **Scan Failures**: error rate
4. **Top Threats**: most common threat patterns
5. **User Patterns**: users with multiple infected uploads

### Recommended Alerts
- Alert if infection rate > 5%
- Alert if same user has 3+ infected uploads
- Alert if quarantine size > 1GB
- Alert if scan error rate > 10%

## Future Enhancements

Planned improvements:
- [ ] Machine learning-based threat detection
- [ ] Behavioral analysis (sandboxing)
- [ ] YARA rules integration
- [ ] Real-time threat intelligence feeds
- [ ] Automated threat response workflows
- [ ] Integration with SIEM systems
- [ ] Advanced reporting and analytics

## Support

For issues or questions:
1. Check this documentation
2. Review scan logs in admin dashboard
3. Check ClamAV status: `clamdscan --version`
4. Review application logs for detailed errors

## Credits

Built with:
- **ClamAV**: Open-source antivirus engine
- **VirusTotal**: Multi-engine cloud scanning
- **Custom Pattern Matching**: Proprietary threat signatures
- **Static Code Analysis**: Custom implementation

---

**Last Updated**: 2025-01-09
**Version**: 1.0.0
