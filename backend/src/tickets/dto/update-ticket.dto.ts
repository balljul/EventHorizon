import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

/**
 * Data Transfer Object for updating an existing ticket.
 * Extends CreateTicketDto with all fields optional.
 * 
 * @class UpdateTicketDto
 * @author Philipp Borkovic
 */
export class UpdateTicketDto extends PartialType(CreateTicketDto) {}