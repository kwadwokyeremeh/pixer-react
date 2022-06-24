import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import tagsJson from '@db/tags.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { Type } from '../types/entities/type.entity';

const tags = plainToClass(Tag, tagsJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(tags, options);

@Injectable()
export class TagsService {
  private tags: Tag[] = tags;

  create(createTagDto: CreateTagDto) {
    return {
      id: this.tags.length + 1,
      ...createTagDto,
    };
  }

  findAll({ page, limit, search }: GetTagsDto) {
    if (!page) page = 1;
    if (!limit) limit = 15;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let data: Tag[] = this.tags;

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // For price
        searchText.push({
          [key]: value,
        });
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/tags?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findOne(param: number | string) {
    const tag = this.tags.find(
      (singleTag) => singleTag.id === Number(param) || singleTag.slug === param,
    );
    
    if (!tag) {
      throw new NotFoundException();
    }

    return tag;
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.tags[0];
  }

  remove(id: number) {
    return `This action removes a #${id} tag`;
  }
}
