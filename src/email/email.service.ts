import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendCommandeStatusEmail(params: {
    to: string;
    commandeId: string;
    prixTotal: string | null;
    statut: string;
  }) {
    const { to, commandeId, prixTotal, statut } = params;

    const subject = `Mise à jour commande #${commandeId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="color:#111827;">Bonjour,</h2>

        <p>
          Votre commande <strong>#${commandeId}</strong>
          a changé de statut.
        </p>

        <ul>
          <li><strong>Statut :</strong> ${statut}</li>
          <li>
            <strong>Prix total :</strong>
            ${prixTotal ? `${prixTotal} DH` : 'N/A'}
          </li>
        </ul>

        <p>Merci pour votre confiance.</p>
      </div>
    `;

    try {
      this.logger.log('Tentative envoi email...');

      const result = await this.mailer.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
      });

      console.log(result);

      this.logger.log(
        `Email envoyé à ${to} pour commande #${commandeId}`,
      );
    } catch (err) {
      console.log('ERREUR SMTP COMPLETE :');
      console.log(err);

      this.logger.error(
        `Échec envoi email à ${to} commande #${commandeId}`,
      );
    }
  }
}