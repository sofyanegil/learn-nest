import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('BooksController', () => {
  let controller: BooksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addBook', () => {
    it('should add a book successfully', () => {
      const book = {
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      };

      const result = controller.addBook(book);
      expect(result).toEqual({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          bookId: expect.any(String),
        },
      });
    });

    it('should throw error if name is missing', () => {
      const book = {
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      };

      expect(() => controller.addBook(book)).toThrow(HttpException);
      expect(() => controller.addBook(book)).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error if readPage is greater than pageCount', () => {
      const book = {
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 101,
        reading: true,
      };

      expect(() => controller.addBook(book)).toThrow(HttpException);
      expect(() => controller.addBook(book)).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message:
              'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getAllBooks', () => {
    it('should return all books', () => {
      const result = controller.getAllBooks({});
      expect(result.status).toBe('success');
      expect(result.data.books).toBeInstanceOf(Array);
    });

    it('should filter books by name', () => {
      controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });

      const result = controller.getAllBooks({ name: 'Test' });
      expect(result.data.books).toHaveLength(1);
      expect(result.data.books[0].name).toBe('Test Book');
    });
  });

  describe('getBookById', () => {
    it('should return a book by id', () => {
      const addedBook = controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });
      const bookId = addedBook.data.bookId;

      const result = controller.getBookById(bookId);
      expect(result.status).toBe('success');
      expect(result.data.book).toBeDefined();
      expect(result.data.book.id).toBe(bookId);
    });

    it('should throw error if book is not found', () => {
      expect(() => controller.getBookById('non-existent-id')).toThrow(
        HttpException,
      );
      expect(() => controller.getBookById('non-existent-id')).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message: 'Buku tidak ditemukan',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('updateBook', () => {
    it('should update a book successfully', () => {
      const addedBook = controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });
      const bookId = addedBook.data.bookId;

      const updatedBook = {
        name: 'Updated Book',
        year: 2022,
        author: 'New Author',
        summary: 'New Summary',
        publisher: 'New Publisher',
        pageCount: 120,
        readPage: 50,
      };

      const result = controller.updateBook(bookId, updatedBook);
      expect(result).toEqual({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });

      const updatedResult = controller.getBookById(bookId);
      expect(updatedResult.data.book.name).toBe('Updated Book');
    });

    it('should throw error if name is missing in update', () => {
      const addedBook = controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });
      const bookId = addedBook.data.bookId;

      const updatedBook = {
        year: 2022,
        author: 'New Author',
        summary: 'New Summary',
        publisher: 'New Publisher',
        pageCount: 120,
        readPage: 50,
      };

      expect(() => controller.updateBook(bookId, updatedBook)).toThrow(
        HttpException,
      );
      expect(() => controller.updateBook(bookId, updatedBook)).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error if readPage is greater than pageCount in update', () => {
      const addedBook = controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });
      const bookId = addedBook.data.bookId;

      const updatedBook = {
        name: 'Updated Book',
        year: 2022,
        author: 'New Author',
        summary: 'New Summary',
        publisher: 'New Publisher',
        pageCount: 120,
        readPage: 130,
      };

      expect(() => controller.updateBook(bookId, updatedBook)).toThrow(
        HttpException,
      );
      expect(() => controller.updateBook(bookId, updatedBook)).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message:
              'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error if book is not found', () => {
      const updatedBook = {
        name: 'Updated Book',
        year: 2022,
        author: 'New Author',
        summary: 'New Summary',
        publisher: 'New Publisher',
        pageCount: 120,
        readPage: 50,
      };

      expect(() =>
        controller.updateBook('non-existent-id', updatedBook),
      ).toThrow(HttpException);
      expect(() =>
        controller.updateBook('non-existent-id', updatedBook),
      ).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', () => {
      const addedBook = controller.addBook({
        name: 'Test Book',
        year: 2021,
        author: 'Author',
        summary: 'Summary',
        publisher: 'Publisher',
        pageCount: 100,
        readPage: 10,
        reading: true,
      });
      const bookId = addedBook.data.bookId;

      const result = controller.deleteBook(bookId);
      expect(result).toEqual({
        status: 'success',
        message: 'Buku berhasil dihapus',
      });

      expect(() => controller.getBookById(bookId)).toThrow(HttpException);
    });

    it('should throw error if book is not found', () => {
      expect(() => controller.deleteBook('non-existent-id')).toThrow(
        HttpException,
      );
      expect(() => controller.deleteBook('non-existent-id')).toThrowError(
        new HttpException(
          {
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
          },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
