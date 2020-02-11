import * as path from 'path';
import * as multer from 'multer';
import { Inject } from 'typedi';
import { Authorized, Body, ContentType, CurrentUser, Delete, Get, JsonController, Param, Patch, Post, Put, QueryParam, Res, UploadedFile } from 'routing-controllers';
import IUserBusiness from '../application/businesses/interfaces/IUserBusiness';
import UserBusiness from '../application/businesses/UserBusiness';
import UserView from '../application/models/user/UserView';
import UserClaim from '../resources/permissions/UserClaim';
import UserUpdate from '../application/models/user/UserUpdate';
import UserSignup from '../application/models/user/UserSignup';
import UserSignin from '../application/models/user/UserSignin';
import PasswordUpdate from '../application/models/user/PasswordUpdate';
import FileHelper from '../helpers/FileHelper';

@JsonController('/users')
export default class UserController {
    @Inject(() => UserBusiness)
    private userBusiness: IUserBusiness;

    @Get('/')
    @Authorized(UserClaim.GET)
    findUsers(@QueryParam('keyword') keyword: string, @QueryParam('skip') skip: number, @QueryParam('limit') limit: number) {
        return this.userBusiness.findUsers(keyword, skip, limit);
    }

    @Get('/:id([0-9]+)')
    @Authorized(UserClaim.GET)
    getUser(@Param('id') id: number) {
        return this.userBusiness.getUser(id);
    }

    @Get('/profile')
    @Authorized()
    getUserProfile(@CurrentUser() currentUser: UserView) {
        return this.userBusiness.getUserProfile(currentUser.id);
    }

    @Get('/export-pdf')
    @ContentType('application/octet-stream')
    exportPDF(@Res() res) {
        const filePath = path.join(__dirname, '../resources/documents/sample.pdf');
        res.set('Content-disposition', 'attachment; filename=sample.pdf');
        return FileHelper.readFile(filePath);
    }

    @Post('/signin')
    signin(@Body() data: UserSignin) {
        return this.userBusiness.signin(data);
    }

    @Post('/signup')
    signup(@Body() data: UserSignup) {
        return this.userBusiness.signup(data);
    }

    @Put('/:id([0-9]+)')
    @Authorized(UserClaim.UPDATE)
    updateUser(@Param('id') id: number, @Body() data: UserUpdate) {
        return this.userBusiness.updateUser(id, data);
    }

    @Put('/profile')
    @Authorized()
    updateProfile(@CurrentUser() currentUser: UserView, @Body() data: UserUpdate) {
        return this.userBusiness.updateUser(currentUser.id, data);
    }

    @Patch('/password')
    @Authorized()
    updatePassword(@CurrentUser() currentUser: UserView, @Body() data: PasswordUpdate) {
        return this.userBusiness.updatePassword(currentUser.id, data);
    }

    @Post('/avatar')
    @Authorized()
    uploadUserAvatar(@CurrentUser() currentUser: UserView, @UploadedFile('avatar', { options: { storage: multer.memoryStorage() } }) file: Express.Multer.File) {
        return this.userBusiness.uploadUserAvatar(currentUser.id, file.buffer);
    }

    @Delete('/:id([0-9]+)')
    @Authorized(UserClaim.DELETE)
    deleteUser(@Param('id') id: number) {
        return this.userBusiness.deleteUser(id);
    }
};
