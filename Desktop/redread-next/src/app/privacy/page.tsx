import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description:
    "Redread gizlilik politikası ve KVKK kapsamında kişisel verilerinizin nasıl işlendiği hakkında bilgi.",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        minHeight: "100vh",
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: "48px" }}>
          <a
            href="/"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
              fontFamily: "'Lora', serif",
              fontWeight: 600,
              fontSize: "1.25rem",
              letterSpacing: "-0.01em",
            }}
          >
            Redread
          </a>
          <h1
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "2rem",
              fontWeight: 600,
              lineHeight: 1.3,
              marginTop: "32px",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Gizlilik Politikası
          </h1>
          <p
            style={{
              color: "var(--muted-foreground)",
              fontSize: "0.9rem",
            }}
          >
            Son güncelleme: Mart 2026
          </p>
        </header>

        {/* Intro */}
        <section style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.8,
              color: "var(--foreground)",
            }}
          >
            Redread olarak gizliliğinize saygı duyuyor ve kişisel verilerinizi
            korumayı taahhüt ediyoruz. Bu politika, 6698 sayılı Kişisel
            Verilerin Korunması Kanunu (KVKK) kapsamında verilerinizin nasıl
            toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
          </p>
        </section>

        <Divider />

        {/* Section 1 */}
        <Section title="1. Kişisel Verilerin İşlenmesi">
          <p>
            Redread, yalnızca platform hizmetlerini sunmak ve geliştirmek
            amacıyla kişisel verilerinizi işler. Verileriniz; açık rıza, meşru
            menfaat ve sözleşmenin ifası hukuki sebeplerine dayanılarak
            işlenmektedir.
          </p>
          <p>
            Kişisel verileriniz hiçbir koşulda üçüncü taraflara satılmaz veya
            kiralanmaz.
          </p>
        </Section>

        <Divider />

        {/* Section 2 */}
        <Section title="2. Toplanan Veriler">
          <p>Platform kullanımı sırasında aşağıdaki veriler toplanabilir:</p>
          <ul
            style={{
              paddingLeft: "20px",
              lineHeight: 2,
              color: "var(--foreground)",
            }}
          >
            <li>
              <strong>E-posta adresi</strong> — hesap oluşturma ve kimlik
              doğrulama için
            </li>
            <li>
              <strong>Profil bilgileri</strong> — kullanıcı adı, biyografi ve
              profil fotoğrafı (isteğe bağlı)
            </li>
            <li>
              <strong>Okuma geçmişi</strong> — okunan hikayeler, beğeniler ve
              kayıtlar
            </li>
            <li>
              <strong>Yazı içerikleri</strong> — platforma yüklenen hikaye ve
              metin verileri
            </li>
            <li>
              <strong>Teknik veriler</strong> — IP adresi, tarayıcı türü ve
              cihaz bilgileri (anonim olarak)
            </li>
          </ul>
        </Section>

        <Divider />

        {/* Section 3 */}
        <Section title="3. Veri Saklama Süresi">
          <p>
            Kişisel verileriniz, hesabınız aktif olduğu sürece ve ilgili yasal
            yükümlülüklerin gerektirdiği süre boyunca saklanır:
          </p>
          <ul
            style={{
              paddingLeft: "20px",
              lineHeight: 2,
              color: "var(--foreground)",
            }}
          >
            <li>
              Hesap verileri: hesap silinene kadar veya en fazla 3 yıl
              hareketsizlik sonrası
            </li>
            <li>
              Teknik log kayıtları: 90 gün
            </li>
            <li>
              Yedekleme verileri: 30 gün
            </li>
          </ul>
          <p>
            Hesabınızı sildiğinizde, kişisel verileriniz 30 gün içinde
            sistemden kalıcı olarak kaldırılır.
          </p>
        </Section>

        <Divider />

        {/* Section 4 */}
        <Section title="4. Kullanıcı Hakları">
          <p>
            KVKK madde 11 kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <ul
            style={{
              paddingLeft: "20px",
              lineHeight: 2,
              color: "var(--foreground)",
            }}
          >
            <li>
              <strong>Bilgi edinme</strong> — verilerinizin işlenip
              işlenmediğini öğrenme
            </li>
            <li>
              <strong>Erişim</strong> — işlenen verilerinize erişim talep etme
            </li>
            <li>
              <strong>Düzeltme</strong> — hatalı veya eksik verilerin
              düzeltilmesini isteme
            </li>
            <li>
              <strong>Silme hakkı</strong> — hesabınızı ve tüm kişisel
              verilerinizi kalıcı olarak silme
            </li>
            <li>
              <strong>İtiraz</strong> — verilerinizin işlenmesine itiraz etme
            </li>
            <li>
              <strong>Veri taşınabilirliği</strong> — verilerinizin yapılandırılmış
              formatta teslim edilmesini talep etme
            </li>
          </ul>
          <p>
            Hesabınızı silmek için uygulama içindeki{" "}
            <strong>Profil → Ayarlar → Hesabı Sil</strong> yolunu
            kullanabilirsiniz.
          </p>
        </Section>

        <Divider />

        {/* Section 5 */}
        <Section title="5. Çerezler (Cookies)">
          <p>
            Redread, yalnızca oturum yönetimi ve tema tercihleri gibi temel
            işlevler için çerez kullanır. Üçüncü taraf izleme çerezleri
            kullanılmamaktadır.
          </p>
        </Section>

        <Divider />

        {/* Section 6 */}
        <Section title="6. İletişim">
          <p>
            Gizlilik politikamız veya kişisel verilerinizle ilgili sorularınız
            için:
          </p>
          <div
            style={{
              marginTop: "16px",
              padding: "20px 24px",
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--muted)",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Redread — Veri Sorumlusu</p>
            <p style={{ margin: "8px 0 0" }}>
              E-posta:{" "}
              <a
                href="mailto:privacy@redread.app"
                style={{
                  color: "var(--primary)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                privacy@redread.app
              </a>
            </p>
          </div>
          <p style={{ marginTop: "16px", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            Başvurunuzu aldıktan sonra en geç 30 gün içinde yanıtlanacaktır.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "40px" }}>
      <h2
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "1.25rem",
          fontWeight: 600,
          marginBottom: "16px",
          letterSpacing: "-0.01em",
          color: "var(--foreground)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: "1rem",
          lineHeight: 1.8,
          color: "var(--foreground)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Divider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--muted)",
        marginBottom: "40px",
      }}
    />
  );
}
