import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dtos/createContact.dto';
import { UpdateContactStatusDto } from './dtos/updateContactStatus.dto';

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('/api/contact')
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get('/api/admin/contact')
  async findAll() {
    return this.contactService.findAll();
  }

  @Patch('/api/admin/contact/:id/statut')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContactStatusDto,
  ) {
    return this.contactService.updateStatus(id, dto);
  }
}
