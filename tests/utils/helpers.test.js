const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../src/config/configs', () => ({
    settings: {
        app: { ACCESS_TOKEN_SECRET: 'testsecret', REFRESH_TOKEN_SECRET: 'refreshsecret' },
        server: { NODE_ENV: 'test' }
    }
}));

const { hashPassword, comparePassword, generateAccessToken } = require('../../src/utils/helpers');

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

    describe('generateAccessToken', () => {
        it('should generate a JWT access token with userId', () => {
            jwt.sign.mockReturnValue('token');

            const token = generateAccessToken('user123');

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 'user123' },
                'testsecret',
                { expiresIn: '5m' }
            );
            expect(token).toBe('token');
        });
    });
});
