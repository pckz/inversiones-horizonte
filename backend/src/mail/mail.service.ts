import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;
  private logger = new Logger(MailService.name);

  constructor(
    private config: ConfigService,
    private settings: SettingsService,
  ) {
    this.resend = new Resend(config.get('RESEND_API_KEY'));
    this.from = config.get('MAIL_FROM', 'Inversiones Horizonte <no-reply@inversiones-horizonte.cl>');
  }

  private async getContactEmail(): Promise<string> {
    return (await this.settings.get('contact_email')) ?? 'pckz+inversioneshorizonte@pckz.cl';
  }

  private async getTransferInstructions(): Promise<string> {
    return (await this.settings.get('transfer_instructions')) ?? '';
  }

  async sendWelcome(to: string, name: string) {
    const replyTo = await this.getContactEmail();
    return this.send({
      to,
      replyTo,
      subject: 'Bienvenido a Inversiones Horizonte',
      html: `
        <h2>Hola ${name},</h2>
        <p>Tu cuenta ha sido creada exitosamente en Inversiones Horizonte.</p>
        <p>Ya puedes explorar nuestros proyectos de inversion inmobiliaria y comenzar a invertir.</p>
        <p>Si tienes alguna consulta, responde directamente a este correo.</p>
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendVerificationReminder(to: string, name: string) {
    const replyTo = await this.getContactEmail();
    return this.send({
      to,
      replyTo,
      subject: 'Verifica tu cuenta - Inversiones Horizonte',
      html: `
        <h2>Hola ${name},</h2>
        <p>Te recordamos que tu cuenta en Inversiones Horizonte aun no ha sido verificada.</p>
        <p>Para completar la verificacion, por favor envia tu documentacion respondiendo a este correo.</p>
        <p>Una vez verificada, podras acceder a todos los beneficios de la plataforma.</p>
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendInvestmentCreated(
    to: string,
    name: string,
    projectTitle: string,
    amount: number,
  ) {
    const replyTo = await this.getContactEmail();
    const transferInstructions = await this.getTransferInstructions();
    const fmtAmount = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);

    const instructionsHtml = transferInstructions
      ? transferInstructions
          .split('\n')
          .map((line) => `<strong>${line}</strong>`)
          .join('<br/>')
      : '';

    return this.send({
      to,
      replyTo,
      subject: `Solicitud de inversion recibida - ${projectTitle}`,
      html: `
        <h2>Hola ${name},</h2>
        <p>Hemos recibido tu solicitud de inversion en <strong>${projectTitle}</strong> por un monto de <strong>${fmtAmount}</strong>.</p>
        
        <h3>Datos para realizar la transferencia</h3>
        <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
          ${instructionsHtml}
        </div>
        
        <h3>Proximos pasos</h3>
        <ol>
          <li>Realiza la transferencia por el monto indicado</li>
          <li>Envia el comprobante de transferencia a <strong>${replyTo}</strong> indicando tu nombre y el proyecto</li>
          <li>Recibiras un correo de confirmacion cuando verifiquemos tu pago</li>
          <li>Podras ver el estado de tu inversion en tu cuenta</li>
        </ol>
        
        <p>Si tienes alguna duda, responde directamente a este correo.</p>
        <br/>
        <p>Saludos,<br/>Equipo Inversiones Horizonte</p>
      `,
    });
  }

  async sendNewInvestmentAdmin(
    adminEmail: string,
    investorName: string,
    investorEmail: string,
    projectTitle: string,
    amount: number,
  ) {
    const fmtAmount = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
    return this.send({
      to: adminEmail,
      subject: `Nueva inversion: ${investorName} en ${projectTitle}`,
      html: `
        <h2>Nueva solicitud de inversion</h2>
        <p><strong>Inversor:</strong> ${investorName} (${investorEmail})</p>
        <p><strong>Proyecto:</strong> ${projectTitle}</p>
        <p><strong>Monto:</strong> ${fmtAmount}</p>
        <p>Revisa el panel de administracion para gestionar esta inversion.</p>
        <br/>
        <p>Inversiones Horizonte</p>
      `,
    });
  }

  async sendInvestmentStatusUpdate(
    to: string,
    name: string,
    projectTitle: string,
    newStatus: string,
  ) {
    const replyTo = await this.getContactEmail();
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
      replyTo,
      subject: `Tu inversion en ${projectTitle} esta ${label}`,
      html: `
        <h2>Hola ${name},</h2>
        <p>Tu inversion en <strong>${projectTitle}</strong> ha cambiado de estado a: <strong>${label}</strong>.</p>
        <p>Puedes revisar los detalles en tu cuenta.</p>
        <p>Si tienes alguna consulta, responde directamente a este correo.</p>
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
    const replyTo = await this.getContactEmail();
    const result = approved ? 'aprobado' : 'rechazado';
    return this.send({
      to,
      replyTo,
      subject: `Tu comprobante de pago fue ${result}`,
      html: `
        <h2>Hola ${name},</h2>
        <p>El comprobante de pago para tu inversion en <strong>${projectTitle}</strong> ha sido <strong>${result}</strong>.</p>
        ${notes ? `<p><em>Nota del administrador: ${notes}</em></p>` : ''}
        <p>Si tienes alguna consulta, responde directamente a este correo.</p>
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
    const replyTo = await this.getContactEmail();
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((to) =>
          this.send({
            to,
            replyTo,
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

  private async send(params: { to: string; subject: string; html: string; replyTo?: string }) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
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
