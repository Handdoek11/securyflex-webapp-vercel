import { sendEmail } from "@/lib/email/service";

interface DocumentNotificationData {
  user: {
    name: string;
    email: string;
  };
  document: {
    id: string;
    documentType: string;
    originalFileName: string;
    status: string;
    rejectionReason?: string;
    adminNotes?: string;
  };
  adminName?: string;
}

export async function sendDocumentUploadNotification(
  data: DocumentNotificationData,
) {
  const { user, document } = data;

  const subject = "Document geüpload - SecuryFlex";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-bottom: 10px;">Document Succesvol Geüpload</h2>
        <p style="color: #666; margin: 0;">Bedankt voor het uploaden van uw document.</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Document Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 0; color: #333;">${getDocumentTypeLabel(document.documentType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Bestandsnaam:</td>
            <td style="padding: 8px 0; color: #333;">${document.originalFileName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
            <td style="padding: 8px 0; color: #333;">
              <span style="background-color: #ffc107; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                Wacht op beoordeling
              </span>
            </td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 4px;">
          <p style="margin: 0; color: #1976d2; font-size: 14px;">
            <strong>Wat gebeurt er nu?</strong><br>
            Uw document wordt handmatig beoordeeld door onze beheerders.
            U ontvangt een e-mail zodra de beoordeling is voltooid.
          </p>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>Dit is een geautomatiseerd bericht van SecuryFlex</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });
    console.log(`Document upload notification sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send document upload notification:", error);
  }
}

export async function sendDocumentApprovedNotification(
  data: DocumentNotificationData,
) {
  const { user, document, adminName } = data;

  const subject = "Document Goedgekeurd - SecuryFlex";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #155724; margin-bottom: 10px;">✅ Document Goedgekeurd</h2>
        <p style="color: #155724; margin: 0;">Uw document is succesvol geverifieerd en goedgekeurd.</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Document Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 0; color: #333;">${getDocumentTypeLabel(document.documentType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Bestandsnaam:</td>
            <td style="padding: 8px 0; color: #333;">${document.originalFileName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
            <td style="padding: 8px 0; color: #333;">
              <span style="background-color: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                Goedgekeurd
              </span>
            </td>
          </tr>
          ${
            adminName
              ? `
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Beoordeeld door:</td>
            <td style="padding: 8px 0; color: #333;">${adminName}</td>
          </tr>
          `
              : ""
          }
        </table>

        ${
          document.adminNotes
            ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Notities van beheerder:</strong><br>
            ${document.adminNotes}
          </p>
        </div>
        `
            : ""
        }

        <div style="margin-top: 20px; padding: 15px; background-color: #d4edda; border-radius: 4px;">
          <p style="margin: 0; color: #155724; font-size: 14px;">
            <strong>Wat betekent dit?</strong><br>
            Uw document is geverifieerd en geaccepteerd. U kunt nu gebruik maken van alle platform functies
            die dit document vereisen.
          </p>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>Dit is een geautomatiseerd bericht van SecuryFlex</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });
    console.log(`Document approved notification sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send document approved notification:", error);
  }
}

export async function sendDocumentRejectedNotification(
  data: DocumentNotificationData,
) {
  const { user, document, adminName } = data;

  const subject = "Document Afgewezen - SecuryFlex";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #721c24; margin-bottom: 10px;">❌ Document Afgewezen</h2>
        <p style="color: #721c24; margin: 0;">Uw document kon helaas niet worden goedgekeurd.</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Document Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 0; color: #333;">${getDocumentTypeLabel(document.documentType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Bestandsnaam:</td>
            <td style="padding: 8px 0; color: #333;">${document.originalFileName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
            <td style="padding: 8px 0; color: #333;">
              <span style="background-color: #dc3545; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                Afgewezen
              </span>
            </td>
          </tr>
          ${
            adminName
              ? `
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Beoordeeld door:</td>
            <td style="padding: 8px 0; color: #333;">${adminName}</td>
          </tr>
          `
              : ""
          }
        </table>

        ${
          document.rejectionReason
            ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8d7da; border-radius: 4px;">
          <p style="margin: 0; color: #721c24; font-size: 14px;">
            <strong>Reden voor afwijzing:</strong><br>
            ${document.rejectionReason}
          </p>
        </div>
        `
            : ""
        }

        ${
          document.adminNotes
            ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Aanvullende notities:</strong><br>
            ${document.adminNotes}
          </p>
        </div>
        `
            : ""
        }

        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Wat kunt u doen?</strong><br>
            • Controleer of het document voldoet aan de gestelde eisen<br>
            • Upload een nieuw, correct document<br>
            • Neem contact op met onze support voor verdere uitleg
          </p>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>Dit is een geautomatiseerd bericht van SecuryFlex</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });
    console.log(`Document rejected notification sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send document rejected notification:", error);
  }
}

export async function sendAdminNewDocumentNotification(
  data: DocumentNotificationData,
) {
  const { user, document } = data;
  const adminEmails = ["stef@securyflex.com", "robert@securyflex.com"];

  const subject = `Nieuw document voor review - ${getDocumentTypeLabel(document.documentType)}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1976d2; margin-bottom: 10px;">📄 Nieuw Document voor Review</h2>
        <p style="color: #1976d2; margin: 0;">Er is een nieuw document geüpload dat uw beoordeling vereist.</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Document Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Gebruiker:</td>
            <td style="padding: 8px 0; color: #333;">${user.name} (${user.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 0; color: #333;">${getDocumentTypeLabel(document.documentType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Bestandsnaam:</td>
            <td style="padding: 8px 0; color: #333;">${document.originalFileName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Upload tijd:</td>
            <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString("nl-NL")}</td>
          </tr>
        </table>

        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/admin/document-review/${document.id}"
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Document Beoordelen
          </a>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>SecuryFlex Admin Notification System</p>
      </div>
    </div>
  `;

  // Send to all admin emails
  for (const adminEmail of adminEmails) {
    try {
      await sendEmail({
        to: adminEmail,
        subject,
        html: htmlContent,
      });
      console.log(
        `Admin notification sent to ${adminEmail} for document ${document.id}`,
      );
    } catch (error) {
      console.error(
        `Failed to send admin notification to ${adminEmail}:`,
        error,
      );
    }
  }
}

export async function sendDocumentExpiryWarning(
  data: DocumentNotificationData & { daysUntilExpiry: number },
) {
  const { user, document, daysUntilExpiry } = data;

  const subject = `Document verloopt binnenkort - ${getDocumentTypeLabel(document.documentType)}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #856404; margin-bottom: 10px;">⚠️ Document Verloopt Binnenkort</h2>
        <p style="color: #856404; margin: 0;">Eén van uw documenten verloopt over ${daysUntilExpiry} dagen.</p>
      </div>

      <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
        <h3 style="color: #333; margin-bottom: 15px;">Document Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Document Type:</td>
            <td style="padding: 8px 0; color: #333;">${getDocumentTypeLabel(document.documentType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Bestandsnaam:</td>
            <td style="padding: 8px 0; color: #333;">${document.originalFileName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Dagen tot verloop:</td>
            <td style="padding: 8px 0; color: #d9534f; font-weight: bold;">${daysUntilExpiry} dagen</td>
          </tr>
        </table>

        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 4px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>Actie vereist:</strong><br>
            Upload een nieuw, geldig document om toegang tot het platform te behouden.
            Verlopen documenten kunnen leiden tot beperkte functionaliteit.
          </p>
        </div>

        <div style="margin-top: 20px; text-align: center;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="display: inline-block; background-color: #ffc107; color: #212529; padding: 12px 24px;
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Nieuw Document Uploaden
          </a>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>Dit is een geautomatiseerd bericht van SecuryFlex</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject,
      html: htmlContent,
    });
    console.log(`Document expiry warning sent to ${user.email}`);
  } catch (error) {
    console.error("Failed to send document expiry warning:", error);
  }
}

function getDocumentTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    IDENTITEITSBEWIJS: "Identiteitsbewijs",
    PASPOORT: "Paspoort",
    RIJBEWIJS: "Rijbewijs",
    KVK_UITTREKSEL: "KvK Uittreksel",
    BTW_NUMMER: "BTW Nummer",
    ND_NUMMER: "ND-nummer",
    LEGITIMATIEBEWIJS: "Legitimatiebewijs",
    TOESTEMMINGSBEWIJS: "Toestemmingsbewijs",
    VOG_P_CERTIFICAAT: "VOG P Certificaat",
    SVPB_DIPLOMA_BEVEILIGER: "SVPB Diploma Beveiliger",
    SVPB_CERTIFICAAT_PERSOONSBEVEILIGING: "SVPB Persoonsbeveiliging",
    SVPB_CERTIFICAAT_WINKELSURVEILLANCE: "SVPB Winkelsurveillance",
    SVPB_CERTIFICAAT_EVENT_SECURITY: "SVPB Event Security",
    SVPB_CERTIFICAAT_CENTRALIST: "SVPB Centralist",
    BOA_CERTIFICAAT: "BOA Certificaat",
    BHV_CERTIFICAAT: "BHV Certificaat",
    KNVB_STEWARD: "KNVB Steward",
    HORECA_PORTIER: "Horeca Portier",
    MBV_CERTIFICAAT: "MBV Certificaat",
    TBV_CERTIFICAAT: "TBV Certificaat",
    VERZEKERINGSBEWIJS: "Verzekeringsbewijs",
    BANKGEGEVENS: "Bankgegevens",
    IBAN_BEWIJS: "IBAN Bewijs",
    CONTRACT: "Contract",
    ARBEIDSOVEREENKOMST: "Arbeidsovereenkomst",
    FREELANCER_OVEREENKOMST: "Freelancer Overeenkomst",
    DIPLOMA_OVERIG: "Diploma (Overig)",
    CERTIFICAAT_OVERIG: "Certificaat (Overig)",
    OVERIGE: "Overige",
  };
  return typeLabels[type] || type;
}
