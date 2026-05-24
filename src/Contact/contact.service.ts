import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateContactDto } from './dtos/createContact.dto';
import { UpdateContactStatusDto } from './dtos/updateContactStatus.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  private formatContact(contact: any) {
    return {
      ...contact,
      id: contact.id.toString(),
    };
  }

  async create(dto: CreateContactDto) {
    const contact = await this.prisma.contact.create({
      data: {
        nom: dto.nom,
        email: dto.email,
        telephone: dto.telephone || null,
        objet: dto.objet,
        message: dto.message,
      },
    });
    return this.formatContact(contact);
  }

  async findAll() {
    const contacts = await this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return contacts.map(c => this.formatContact(c));
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto) {
    try {
      const contact = await this.prisma.contact.update({
        where: { id: BigInt(id) },
        data: { statut: dto.statut },
      });
      return this.formatContact(contact);
    } catch (err) {
      throw new NotFoundException(`Message de contact avec l'ID ${id} non trouvé`);
    }
  }
}
