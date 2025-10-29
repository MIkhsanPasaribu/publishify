# 📋 Backend TODO List - Publishify

**Version:** 1.0  
**Last Updated:** 29 Oktober 2025  
**Status:** 3 TODO items ditemukan

---

## 📊 Summary

| Kategori        | Jumlah      | Priority  | Estimasi        |
| --------------- | ----------- | --------- | --------------- |
| Email Service   | 2 items     | 🔴 HIGH   | 8-12 hours      |
| Payment Gateway | 1 item      | 🟠 MEDIUM | 4-6 hours       |
| **TOTAL**       | **3 items** | -         | **12-18 hours** |

---

## 🔴 HIGH PRIORITY TODO Items

### 1. Email Verifikasi Pengguna

**File:** `src/modules/auth/auth.service.ts`  
**Line:** 131  
**Method:** `daftar()`

**TODO Comment:**

```typescript
// TODO: Kirim email verifikasi
// await this.emailService.kirimEmailVerifikasi(pengguna.email, tokenVerifikasi);
```

**Context:**

```typescript
// Dalam method daftar() setelah membuat pengguna baru
return newPengguna;
});

// TODO: Kirim email verifikasi
// await this.emailService.kirimEmailVerifikasi(pengguna.email, tokenVerifikasi);

return {
  sukses: true,
  pesan: 'Registrasi berhasil. Silakan cek email untuk verifikasi akun.',
  data: {
    id: pengguna.id,
    email: pengguna.email,
    tokenVerifikasi, // Untuk development, nanti dihapus
  },
};
```

**Description:**

- Implementasi email service untuk mengirim email verifikasi setelah registrasi
- Email berisi link verifikasi dengan token yang sudah di-generate
- Format: `${FRONTEND_URL}/verifikasi-email?token=${tokenVerifikasi}`

**Implementation Requirements:**

1. **Email Service Integration:**

   - Setup Nodemailer dengan SMTP config (Gmail/SendGrid/Mailgun)
   - Buat `EmailService` dengan method `kirimEmailVerifikasi()`
   - Template HTML untuk email verifikasi

2. **Email Template Content:**

   - Subject: "Verifikasi Email Anda - Publishify"
   - Body: Selamat datang message
   - Button: "Verifikasi Email" dengan link ke frontend
   - Footer: Copyright dan unsubscribe link

3. **Configuration Required:**

   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=noreply@publishify.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Publishify <noreply@publishify.com>
   FRONTEND_URL=http://localhost:3000
   ```

4. **Queue Integration:**
   - Gunakan Bull queue untuk async email sending
   - Retry mechanism (max 3 attempts)
   - Logging untuk debugging

**Files to Create/Modify:**

- ✅ `src/modules/email/email.service.ts` (NEW)
- ✅ `src/modules/email/email.module.ts` (NEW)
- ✅ `src/modules/email/templates/verifikasi-email.hbs` (NEW)
- ✅ `src/modules/email/processors/email.processor.ts` (NEW)
- 🔄 `src/modules/auth/auth.service.ts` (MODIFY - uncomment TODO line)
- 🔄 `src/modules/auth/auth.module.ts` (MODIFY - import EmailModule)

**Estimated Effort:** 4-6 hours

**Priority Reason:**

- Critical untuk user onboarding flow
- Keamanan: Validasi email sebelum full access
- User experience: Professional registration flow

---

### 2. Email Reset Password

**File:** `src/modules/auth/auth.service.ts`  
**Line:** 415  
**Method:** `lupaPassword()`

**TODO Comment:**

```typescript
// TODO: Kirim email reset password
// await this.emailService.kirimEmailResetPassword(pengguna.email, tokenReset);
```

**Context:**

```typescript
// Dalam method lupaPassword() setelah generate token reset
await this.prisma.tokenResetPassword.create({
  data: {
    idPengguna: pengguna.id,
    token: tokenReset,
    kadaluarsaPada: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 jam
  },
});

// TODO: Kirim email reset password
// await this.emailService.kirimEmailResetPassword(pengguna.email, tokenReset);

// Log aktivitas
await this.prisma.logAktivitas.create({
  data: {
    idPengguna: pengguna.id,
    jenis: "lupa_password",
    aksi: "Lupa Password",
    deskripsi: "Request reset password",
  },
});
```

**Description:**

- Implementasi email service untuk mengirim link reset password
- Email berisi link reset dengan token yang valid 1 jam
- Format: `${FRONTEND_URL}/reset-password?token=${tokenReset}`

**Implementation Requirements:**

1. **Email Service Method:**

   - Method: `kirimEmailResetPassword(email: string, token: string)`
   - Template: Handlebars template untuk reset password email
   - Validation: Check email exists sebelum kirim

2. **Email Template Content:**

   - Subject: "Reset Password Anda - Publishify"
   - Body: Instruksi reset password
   - Warning: Token valid 1 jam
   - Button: "Reset Password" dengan link ke frontend
   - Security note: Ignore jika tidak request

3. **Queue Configuration:**
   - Priority: HIGH (urgent email)
   - Retry: 3 attempts dengan backoff
   - Notification jika gagal kirim

**Files to Create/Modify:**

- ✅ `src/modules/email/templates/reset-password.hbs` (NEW)
- 🔄 `src/modules/email/email.service.ts` (MODIFY - add method)
- 🔄 `src/modules/auth/auth.service.ts` (MODIFY - uncomment TODO line)

**Estimated Effort:** 4-6 hours (sama dengan TODO #1, bisa dikerjakan bersamaan)

**Priority Reason:**

- Critical untuk security: User recovery flow
- User experience: Smooth password recovery
- Reduces support tickets untuk "lupa password"

**Combined Implementation (TODO #1 + #2):**
Karena kedua TODO ini terkait Email Service, sebaiknya dikerjakan bersamaan:

**Total Estimated Effort:** 8-12 hours (parallel implementation)

**Implementation Steps:**

1. Setup EmailModule dengan Nodemailer (2-3h)
2. Create email templates (verifikasi + reset) (2-3h)
3. Implement Bull queue untuk email (2-3h)
4. Testing & error handling (2-3h)

---

## 🟠 MEDIUM PRIORITY TODO Items

### 3. Payment Gateway Signature Verification

**File:** `src/modules/pembayaran/pembayaran.service.ts`  
**Line:** 291  
**Method:** `verifikasiPembayaran()`

**TODO Comment:**

```typescript
// TODO: Implement signature verification logic
```

**Context:**

```typescript
/**
 * Verifikasi pembayaran (cek signature dari payment gateway)
 * Digunakan untuk validasi webhook
 */
async verifikasiPembayaran(signature: string, data: any): Promise<boolean> {
  // TODO: Implement signature verification logic
  // Contoh untuk Midtrans:
  // const serverKey = process.env.MIDTRANS_SERVER_KEY;
  // const hash = crypto.createHash('sha512');
  // hash.update(`${data.order_id}${data.status_code}${data.gross_amount}${serverKey}`);
  // const expectedSignature = hash.digest('hex');
  // return signature === expectedSignature;

  // Untuk development, return true
  return true;
}
```

**Description:**

- Implementasi signature verification untuk webhook payment gateway
- Validasi bahwa webhook request benar-benar dari payment gateway (bukan fake request)
- Support multiple payment gateways (Midtrans, Xendit, dll)

**Implementation Requirements:**

1. **Midtrans Signature Verification:**

   ```typescript
   import * as crypto from 'crypto';

   async verifikasiMidtrans(signature: string, data: any): Promise<boolean> {
     const serverKey = process.env.MIDTRANS_SERVER_KEY;
     const orderId = data.order_id;
     const statusCode = data.status_code;
     const grossAmount = data.gross_amount;

     const hash = crypto.createHash('sha512');
     hash.update(`${orderId}${statusCode}${grossAmount}${serverKey}`);
     const expectedSignature = hash.digest('hex');

     return signature === expectedSignature;
   }
   ```

2. **Xendit Signature Verification:**

   ```typescript
   async verifikasiXendit(signature: string, data: any): Promise<boolean> {
     const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN;
     const rawBody = JSON.stringify(data);

     const hash = crypto.createHmac('sha256', webhookToken);
     hash.update(rawBody);
     const expectedSignature = hash.digest('hex');

     return signature === expectedSignature;
   }
   ```

3. **Strategy Pattern Implementation:**

   ```typescript
   interface PaymentGatewayVerifier {
     verify(signature: string, data: any): Promise<boolean>;
   }

   class MidtransVerifier implements PaymentGatewayVerifier {
     async verify(signature: string, data: any): Promise<boolean> {
       // Implementation
     }
   }

   class XenditVerifier implements PaymentGatewayVerifier {
     async verify(signature: string, data: any): Promise<boolean> {
       // Implementation
     }
   }
   ```

4. **Configuration Required:**

   ```env
   # Midtrans
   MIDTRANS_SERVER_KEY=your-server-key
   MIDTRANS_CLIENT_KEY=your-client-key
   MIDTRANS_IS_PRODUCTION=false

   # Xendit
   XENDIT_SECRET_KEY=your-secret-key
   XENDIT_WEBHOOK_TOKEN=your-webhook-token
   XENDIT_PUBLIC_KEY=your-public-key

   # Default Gateway
   PAYMENT_GATEWAY=midtrans
   ```

5. **Security Considerations:**

   - Always verify signature sebelum process webhook
   - Log suspicious requests (signature mismatch)
   - Rate limiting untuk webhook endpoint
   - IP whitelist untuk payment gateway

6. **Error Handling:**
   ```typescript
   try {
     const isValid = await this.verifikasiPembayaran(signature, data);
     if (!isValid) {
       throw new UnauthorizedException("Signature tidak valid");
     }
   } catch (error) {
     // Log suspicious activity
     await this.logService.logSuspiciousWebhook(data, signature);
     throw new BadRequestException("Webhook verification gagal");
   }
   ```

**Files to Create/Modify:**

- ✅ `src/modules/pembayaran/verifiers/midtrans.verifier.ts` (NEW)
- ✅ `src/modules/pembayaran/verifiers/xendit.verifier.ts` (NEW)
- ✅ `src/modules/pembayaran/verifiers/index.ts` (NEW)
- ✅ `src/modules/pembayaran/interfaces/payment-gateway-verifier.interface.ts` (NEW)
- 🔄 `src/modules/pembayaran/pembayaran.service.ts` (MODIFY - implement verification)
- 🔄 `src/config/payment-gateway.config.ts` (NEW)

**Estimated Effort:** 4-6 hours

**Priority Reason:**

- Security: Prevent fake webhook attacks
- Medium priority karena saat ini return true (development mode OK)
- Harus diimplementasi sebelum production deployment
- Proteksi dari fraudulent transactions

**Testing Requirements:**

- Unit tests untuk setiap verifier
- Integration tests dengan mock webhooks
- Manual testing dengan actual payment gateway sandbox
- Test cases:
  - ✅ Valid signature → return true
  - ❌ Invalid signature → return false
  - ❌ Tampered data → return false
  - ❌ Missing signature → throw error

---

## 📈 Implementation Timeline

### Phase 1: Email Service (Week 1)

**Duration:** 8-12 hours (2-3 days)

**Day 1-2:**

- Setup EmailModule & Nodemailer configuration
- Create email templates (Handlebars)
- Implement `kirimEmailVerifikasi()` method
- Implement `kirimEmailResetPassword()` method

**Day 2-3:**

- Setup Bull queue untuk email processing
- Add retry mechanism & error handling
- Testing email sending (sandbox)
- Update Auth module untuk uncomment TODO lines

**Deliverables:**

- ✅ Email service fully functional
- ✅ 2 TODO items (#1, #2) completed
- ✅ Email templates designed
- ✅ Queue system operational

---

### Phase 2: Payment Gateway Security (Week 2)

**Duration:** 4-6 hours (1 day)

**Day 1:**

- Implement signature verification strategy pattern
- Create Midtrans verifier
- Create Xendit verifier (optional)
- Update pembayaran service
- Testing dengan sandbox webhooks

**Deliverables:**

- ✅ Signature verification implemented
- ✅ 1 TODO item (#3) completed
- ✅ Security enhanced
- ✅ Ready for production webhooks

---

## ✅ Completion Checklist

### TODO #1: Email Verifikasi ✅

- [ ] EmailModule created
- [ ] Nodemailer configured
- [ ] Template `verifikasi-email.hbs` created
- [ ] Method `kirimEmailVerifikasi()` implemented
- [ ] Bull queue setup
- [ ] Auth service updated (uncomment line 131)
- [ ] Testing completed
- [ ] Documentation updated

### TODO #2: Email Reset Password ✅

- [ ] Template `reset-password.hbs` created
- [ ] Method `kirimEmailResetPassword()` implemented
- [ ] Auth service updated (uncomment line 415)
- [ ] Testing completed
- [ ] Security validation added

### TODO #3: Payment Gateway Verification ✅

- [ ] Strategy pattern interface created
- [ ] Midtrans verifier implemented
- [ ] Xendit verifier implemented (optional)
- [ ] Pembayaran service updated (replace return true)
- [ ] Configuration added to .env.example
- [ ] Unit tests created
- [ ] Integration tests passed
- [ ] Sandbox testing completed

---

## 🎯 Success Metrics

**After completing all TODOs:**

1. **Email System:**

   - ✅ 100% email delivery rate (sandbox)
   - ✅ < 5 second processing time
   - ✅ Retry mechanism working
   - ✅ Error logging functional

2. **Payment Security:**

   - ✅ 0% fake webhook acceptance
   - ✅ 100% valid webhook acceptance
   - ✅ Signature verification < 100ms
   - ✅ Suspicious activity logged

3. **Code Quality:**
   - ✅ 0 TODO comments remaining
   - ✅ Test coverage > 80% for new code
   - ✅ No TypeScript errors
   - ✅ Documentation complete

---

## 📚 Related Documentation

- [Backend Deep Analysis](./backend-deep-analysis.md) - Full gap analysis
- [API Testing Guide](./api-testing-guide.md) - Testing procedures
- [Email Templates Guide](#) - Template design guidelines (TBD)
- [Payment Gateway Integration](#) - Gateway setup guide (TBD)

---

## 🔗 External Resources

### Email Service:

- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Handlebars Templates](https://handlebarsjs.com/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

### Payment Gateway:

- [Midtrans Webhook Docs](https://docs.midtrans.com/en/after-payment/http-notification)
- [Xendit Webhook Docs](https://developers.xendit.co/api-reference/#webhook-notifications)
- [Crypto Module Node.js](https://nodejs.org/api/crypto.html)

---

## 💡 Additional Recommendations

### 1. Email Service Enhancements (Future)

- [ ] Add email preview endpoint (development)
- [ ] Implement email templates version control
- [ ] Add A/B testing untuk subject lines
- [ ] Analytics: Open rate tracking
- [ ] Unsubscribe management

### 2. Payment Gateway Enhancements (Future)

- [ ] Support lebih banyak gateways (Doku, PayPal, Stripe)
- [ ] Implement refund automation
- [ ] Payment analytics dashboard
- [ ] Fraud detection AI/ML
- [ ] Multi-currency support

### 3. Monitoring & Alerting

- [ ] Email delivery failure alerts
- [ ] Webhook verification failure alerts
- [ ] Queue monitoring dashboard
- [ ] Performance metrics tracking

---

**Status:** 3 TODO items identified, 0 completed  
**Next Action:** Start with Phase 1 (Email Service Implementation)  
**Last Updated:** 29 Oktober 2025
