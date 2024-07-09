import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  Put,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
  Redirect,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import books from './books';

interface Book {
  id: string;
  name: string;
  year: number;
  author: string;
  summary: string;
  publisher: string;
  pageCount: number;
  readPage: number;
  finished: boolean;
  reading: boolean;
  insertedAt: string;
  updatedAt: string;
}

@Controller('books')
export class BooksController {
  @Get('/redirect')
  @Redirect('https://nestjs.com', 301)
  getDocs(@Query('version') version) {
    if (version && version === '5') {
      return { url: 'https://docs.nestjs.com/v5/' };
    }
  }

  @Post()
  @HttpCode(201)
  addBook(@Body() body: any) {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = body;

    if (!name) {
      throw new HttpException(
        {
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (readPage > pageCount) {
      throw new HttpException(
        {
          status: 'fail',
          message:
            'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const id: string = `book-${uuidv4()}`;
    const finished: boolean = pageCount === readPage;
    const insertedAt: string = new Date().toISOString();
    const updatedAt: string = insertedAt;

    const newBook: Book = {
      id,
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);

    const isSuccess: boolean = books.some((book: Book) => book.id === id);

    if (isSuccess) {
      return {
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: id,
        },
      };
    }

    throw new HttpException(
      {
        status: 'error',
        message: 'Buku gagal ditambahkan',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get()
  getAllBooks(@Query() query: any) {
    const { name, reading, finished } = query;
    let filteredBooks: Book[] = books;

    if (name) {
      filteredBooks = filteredBooks.filter((book: Book) =>
        book.name.toLowerCase().includes(name.toLowerCase()),
      );
    }

    if (reading !== undefined) {
      filteredBooks = filteredBooks.filter(
        (book: Book) => book.reading === !!Number(reading),
      );
    }

    if (finished !== undefined) {
      filteredBooks = filteredBooks.filter(
        (book: Book) => book.finished === !!Number(finished),
      );
    }

    return {
      status: 'success',
      data: {
        books: filteredBooks.map((book: Book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    };
  }

  @Get(':bookId')
  getBookById(@Param('bookId') bookId: string) {
    const book: Book | undefined = books.find((b: Book) => b.id === bookId);
    if (book) {
      return {
        status: 'success',
        data: {
          book,
        },
      };
    }

    throw new HttpException(
      {
        status: 'fail',
        message: 'Buku tidak ditemukan',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  @Put(':bookId')
  updateBook(@Param('bookId') bookId: string, @Body() body: any) {
    const index: number = books.findIndex((book: Book) => book.id === bookId);

    if (index !== -1) {
      const { name, year, author, summary, publisher, pageCount, readPage } =
        body;

      if (!name) {
        throw new HttpException(
          {
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (readPage > pageCount) {
        throw new HttpException(
          {
            status: 'fail',
            message:
              'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const finished: boolean = readPage === pageCount;

      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        updatedAt: new Date().toISOString(),
      };

      return {
        status: 'success',
        message: 'Buku berhasil diperbarui',
      };
    }

    throw new HttpException(
      {
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  @Delete(':bookId')
  deleteBook(@Param('bookId') bookId: string) {
    const index: number = books.findIndex((book: Book) => book.id === bookId);

    if (index !== -1) {
      books.splice(index, 1);
      return {
        status: 'success',
        message: 'Buku berhasil dihapus',
      };
    }

    throw new HttpException(
      {
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
