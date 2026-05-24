import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailer: MailerService) {}

  async sendOrderConfirmation(
    clientEmail: string | null | undefined,
    clientNom: string | null | undefined,
    codeSuivi: string | null | undefined
  ) {
    if (!clientEmail) {
      this.logger.warn(`[sendOrderConfirmation] Aucun email défini pour le client ${clientNom}`);
      return;
    }

    const trackingCode = codeSuivi || 'N/A';
    const subject = `Confirmation de votre commande - Menuiserie Digitale`;
    const trackingUrl = `http://localhost:3000/suivi?code=${trackingCode}`;

    const html = `
      <div style="font-family: 'Noto Serif', Georgia, serif; line-height: 1.6; color: #1c1c18; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcf9f3; border: 1px solid rgba(45, 90, 39, 0.1); border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D5A27; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">Menuiserie Digitale</h1>
          <p style="color: #A67B5B; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">L'excellence du sur-mesure</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(28, 28, 24, 0.05); box-shadow: 0 10px 20px rgba(28, 28, 24, 0.02);">
          <h2 style="color: #2D5A27; font-size: 20px; margin-top: 0; font-weight: normal;">Bonjour ${clientNom || 'Client'},</h2>
          <p style="font-size: 14px; color: #555555; margin-bottom: 20px;">
            Nous vous remercions pour votre confiance. Votre commande a été enregistrée avec succès au sein de notre atelier de menuiserie d'exception à Marrakech.
          </p>
          
          <div style="background-color: #f6f3ed; padding: 20px; border-radius: 8px; border-left: 4px solid #A67B5B; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Votre code unique de suivi</p>
            <p style="margin: 5px 0 0 0; font-size: 22px; font-weight: bold; color: #2D5A27; letter-spacing: 1px;">${trackingCode}</p>
          </div>

          <p style="font-size: 14px; color: #555555; margin-bottom: 30px;">
            Vous pouvez suivre en temps réel chaque étape de la fabrication artisanale de votre pièce en cliquant sur le bouton ci-dessous :
          </p>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #2D5A27; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: background-color 0.3s;">Suivre ma création</a>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgba(28, 28, 24, 0.08); padding-top: 20px;">
          <p style="font-size: 11px; color: #888888; margin: 0;">Menuiserie Digitale — Marrakech, Maroc</p>
          <p style="font-size: 10px; color: #aaaaaa; margin: 5px 0 0 0;">Ce message a été généré automatiquement, merci de ne pas y répondre directement.</p>
        </div>
      </div>
    `;

    try {
      this.logger.log(`Envoi de l'email de confirmation à ${clientEmail}...`);
      await this.mailer.sendMail({
        to: clientEmail,
        subject,
        html,
      });
      this.logger.log(`Email de confirmation envoyé avec succès à ${clientEmail}`);
    } catch (error) {
      console.error("=== STRICT SMTP DELIVERY ERROR ===", error);
      this.logger.error(`Échec envoi email de confirmation à ${clientEmail}: ${String(error)}`);
    }
  }

  async sendStatusUpdate(
    clientEmail: string | null | undefined,
    clientNom: string | null | undefined,
    codeSuivi: string | null | undefined,
    newStatus: string | null | undefined
  ) {
    if (!clientEmail) {
      this.logger.warn(`[sendStatusUpdate] Aucun email défini pour le client ${clientNom}`);
      return;
    }

    const trackingCode = codeSuivi || 'N/A';
    const statusLabel = newStatus || 'En attente';
    const subject = `Mise à jour de votre création - Menuiserie Digitale`;
    const trackingUrl = `http://localhost:3000/suivi?code=${trackingCode}`;

    const html = `
      <div style="font-family: 'Noto Serif', Georgia, serif; line-height: 1.6; color: #1c1c18; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcf9f3; border: 1px solid rgba(45, 90, 39, 0.1); border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D5A27; font-size: 28px; margin: 0; font-weight: normal; font-style: italic;">Menuiserie Digitale</h1>
          <p style="color: #A67B5B; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Votre création prend vie</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid rgba(28, 28, 24, 0.05); box-shadow: 0 10px 20px rgba(28, 28, 24, 0.02);">
          <h2 style="color: #2D5A27; font-size: 20px; margin-top: 0; font-weight: normal;">Bonjour ${clientNom || 'Client'},</h2>
          <p style="font-size: 14px; color: #555555; margin-bottom: 20px;">
            Nous sommes heureux de vous informer qu'une nouvelle étape a été franchie dans l'atelier pour la réalisation de votre projet sur-mesure.
          </p>
          
          <div style="background-color: #f6f3ed; padding: 20px; border-radius: 8px; border-left: 4px solid #A67B5B; margin: 25px 0; text-align: center;">
            <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888888;">Nouveau Statut de Commande</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #2D5A27; text-transform: capitalize;">${statusLabel}</p>
          </div>

          <p style="font-size: 14px; color: #555555; margin-bottom: 30px;">
            Vous pouvez consulter le statut complet et les détails associés directement via notre portail de suivi en ligne :
          </p>
          
          <div style="text-align: center; margin-bottom: 20px;">
            <a href="${trackingUrl}" style="display: inline-block; background-color: #2D5A27; color: #ffffff; text-decoration: none; padding: 15px 35px; border-radius: 8px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: background-color 0.3s;">Accéder au Suivi</a>
          </div>
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid rgba(28, 28, 24, 0.08); padding-top: 20px;">
          <p style="font-size: 11px; color: #888888; margin: 0;">Menuiserie Digitale — Marrakech, Maroc</p>
          <p style="font-size: 10px; color: #aaaaaa; margin: 5px 0 0 0;">Ce message a été généré automatiquement, merci de ne pas y répondre directement.</p>
        </div>
      </div>
    `;

    try {
      this.logger.log(`Envoi de la mise à jour de statut (${statusLabel}) à ${clientEmail}...`);
      await this.mailer.sendMail({
        to: clientEmail,
        subject,
        html,
      });
      this.logger.log(`Email de statut envoyé avec succès à ${clientEmail}`);
    } catch (error) {
      console.error("=== STRICT SMTP DELIVERY ERROR ===", error);
      this.logger.error(`Échec envoi email de statut à ${clientEmail}: ${String(error)}`);
    }
  }
}