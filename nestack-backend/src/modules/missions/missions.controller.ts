import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MissionsService } from './missions.service';
import {
  CreateMissionDto,
  UpdateMissionDto,
  UpdateMissionStatusDto,
  MissionQueryDto,
  LinkTransactionDto,
} from './dto';
import { CurrentUser } from '../../common/decorators';
import { User } from '../users/entities/user.entity';

@ApiTags('missions')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'missions', version: '1' })
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('categories')
  @ApiOperation({ summary: '생애주기 카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '카테고리 목록 반환' })
  async getCategories() {
    const categories = await this.missionsService.getCategories();
    return { categories };
  }

  @Get('templates')
  @ApiOperation({ summary: '미션 템플릿 목록 조회' })
  @ApiResponse({ status: 200, description: '템플릿 목록 반환' })
  async getTemplates(@Query('categoryId') categoryId?: string) {
    const templates = await this.missionsService.getTemplates(categoryId);
    return { templates };
  }

  @Post()
  @ApiOperation({ summary: '미션 생성' })
  @ApiResponse({ status: 201, description: '미션 생성 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 데이터' })
  async create(
    @CurrentUser() user: User,
    @Body() createMissionDto: CreateMissionDto,
  ) {
    const mission = await this.missionsService.create(
      user.id,
      createMissionDto,
      user.familyGroupId,
    );
    return { mission, message: '미션이 생성되었습니다.' };
  }

  @Get()
  @ApiOperation({ summary: '미션 목록 조회' })
  @ApiResponse({ status: 200, description: '미션 목록 반환' })
  async findAll(
    @CurrentUser() user: User,
    @Query() query: MissionQueryDto,
  ) {
    const missions = await this.missionsService.findAll(
      user.id,
      query,
      user.familyGroupId,
    );
    return { missions };
  }

  @Get('summary')
  @ApiOperation({ summary: '미션 진행 요약 조회' })
  @ApiResponse({ status: 200, description: '미션 진행 요약 반환' })
  async getProgressSummary(@CurrentUser() user: User) {
    const summary = await this.missionsService.getProgressSummary(
      user.id,
      user.familyGroupId,
    );
    return { summary };
  }

  @Get(':id')
  @ApiOperation({ summary: '미션 상세 조회' })
  @ApiParam({ name: 'id', description: '미션 ID' })
  @ApiResponse({ status: 200, description: '미션 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '미션을 찾을 수 없음' })
  async findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const mission = await this.missionsService.findById(id, user.id);
    return {
      mission: {
        ...mission,
        progressPercent: mission.progressPercent,
      },
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: '미션 수정' })
  @ApiParam({ name: 'id', description: '미션 ID' })
  @ApiResponse({ status: 200, description: '미션 수정 성공' })
  @ApiResponse({ status: 404, description: '미션을 찾을 수 없음' })
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMissionDto: UpdateMissionDto,
  ) {
    const mission = await this.missionsService.update(id, user.id, updateMissionDto);
    return { mission, message: '미션이 수정되었습니다.' };
  }

  @Post(':id/status')
  @ApiOperation({ summary: '미션 상태 변경' })
  @ApiParam({ name: 'id', description: '미션 ID' })
  @ApiResponse({ status: 200, description: '미션 상태 변경 성공' })
  @ApiResponse({ status: 400, description: '유효하지 않은 상태 전환' })
  async updateStatus(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateMissionStatusDto,
  ) {
    const mission = await this.missionsService.updateStatus(id, user.id, updateStatusDto);
    return { mission, message: '미션 상태가 변경되었습니다.' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '미션 삭제' })
  @ApiParam({ name: 'id', description: '미션 ID' })
  @ApiResponse({ status: 200, description: '미션 삭제 성공' })
  @ApiResponse({ status: 404, description: '미션을 찾을 수 없음' })
  async delete(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.missionsService.delete(id, user.id);
    return { message: '미션이 삭제되었습니다.' };
  }

  @Post(':id/transactions')
  @ApiOperation({ summary: '거래 내역 미션에 연결' })
  @ApiParam({ name: 'id', description: '미션 ID' })
  @ApiResponse({ status: 200, description: '거래 연결 성공' })
  @ApiResponse({ status: 404, description: '미션 또는 거래를 찾을 수 없음' })
  async linkTransactions(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() linkDto: LinkTransactionDto,
  ) {
    const mission = await this.missionsService.linkTransactions(id, user.id, linkDto);
    return { mission, message: '거래가 미션에 연결되었습니다.' };
  }
}
