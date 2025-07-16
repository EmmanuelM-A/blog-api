const { hashPassword, comparePassword, generateToken } = require('../../utils/helpers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('helpers', () => {
    describe('hashPassword', () => {
        it('should hash a password using bcrypt', async () => {
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            const result = await hashPassword('myPassword');

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
            expect(bcrypt.hash).toHaveBeenCalledWith('myPassword', 'salt');
            expect(result).toBe('hashedPassword');
        });
    });

    describe('comparePassword', () => {
        it('should compare passwords using bcrypt', async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await comparePassword('input', 'hash');
            expect(bcrypt.compare).toHaveBeenCalledWith('input', 'hash');
            expect(result).toBe(true);
        });
    });

    describe('generateToken', () => {
        const OLD_ENV = process.env;

        beforeEach(() => {
            jest.resetModules();
            process.env = { ...OLD_ENV, ACCESS_TOKEN_SECRET: 'testsecret' };
        });

        afterAll(() => {
            process.env = OLD_ENV;
        });

        it('should generate a JWT token with userId', () => {
            jwt.sign.mockReturnValue('token');
            const token = generateToken('user123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 'user123' },
                'testsecret',
                { expiresIn: '5m' }
            );
            expect(token).toBe('token');
        });
    });
});