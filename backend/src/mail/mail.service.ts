import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
    this.from = config.get('MAIL_FROM', 'Inversiones Horizonte <no-reply@inversiones-horizonte.cl>');
  }

  async sendWelcome(to: string, name: string) {
    return this.send({
      to,
      subject: 'Bienvenido a Inversiones Horizonte',
      html: `
        <h2>Hola ${name},</h2>
        <p>Tu cuenta ha sido creada exitosamente en Inversiones Horizonte.</p>
        <p>Ya puedes explorar nuestros proyectos de inversion inmobiliaria y comenzar a invertir.</p>
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendInvestmentStatusUpdate(
    to: string,
    name: string,
    projectTitle: string,
    newStatus: string,
  ) {
    const statusLabels: Record<string, string> = {
      transfer_pending: 'esperando tu transferencia',
      transfer_review: 'en revision',
      signed: 'firmada',
      active: 'activa',
      completed: 'completada',
      cancelled: 'cancelada',
    };
    const label = statusLabels[newStatus] ?? newStatus;

    return this.send({
      to,
      subject: `Tu inversion en ${projectTitle} esta ${label}`,
      html: `
        <h2>Hola ${name},</h2>
        <p>Tu inversion en <strong>${projectTitle}</strong> ha cambiado de estado a: <strong>${label}</strong>.</p>
        <p>Puedes revisar los detalles en tu cuenta.</p>
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendPaymentReviewed(
    to: string,
    name: string,
    projectTitle: string,
    approved: boolean,
    notes?: string,
  ) {
    const result = approved ? 'aprobado' : 'rechazado';
    return this.send({
      to,
      subject: `Tu comprobante de pago fue ${result}`,
      html: `
        <h2>Hola ${name},</h2>
        <p>El comprobante de pago para tu inversion en <strong>${projectTitle}</strong> ha sido <strong>${result}</strong>.</p>
        ${notes ? `<p><em>Nota del administrador: ${notes}</em></p>` : ''}
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendProjectAnnouncement(
    recipients: string[],
    projectTitle: string,
    updateTitle: string,
    body: string,
  ) {
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((to) =>
          this.send({
            to,
            subject: `${projectTitle}: ${updateTitle}`,
            html: `
              <h2>${updateTitle}</h2>
              <p>${body}</p>
              <br/>
              <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
            `,
          }),
        ),
      );
    }
  }

  private async send(params: { to: string; subject: string; html: string }) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      if (error) {
        this.logger.error(`Failed to send email to ${params.to}: ${error.message}`);
      }
      return data;
    } catch (err) {
      this.logger.error(`Email send error: ${err}`);
    }
  }
}
