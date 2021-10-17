import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { SharedPreferencesI, UserInfoI } from 'src/app/shared/ft_interfaces';
import { SettingsService } from './settings.service';
import { mDate } from 'src/app/utils/date';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
	@Input() settingsPreference: SharedPreferencesI;
	@ViewChild('factor_input') factorElement: ElementRef<HTMLInputElement>;
	@ViewChild('imageInput') imageFile: ElementRef<HTMLInputElement>;

	file: File;
	showMsgBox : boolean = false;
	msgError: boolean;
	showCodeInput: boolean;
	showQrImg: boolean;
	qrUrl: string;
	update_message : string = "";
	session = this.sQuery.getSessionToken();
	code: number;
	qrButtonValue: string = "Show QR";
	formNickname: string;
	formEmail: string;
	formFactor: boolean;
	constructor(
		private sQuery: SessionStorageQueryService,
		private settingService: SettingsService,
		private router: Router
		) {
		}
		
  
  	ngOnInit(): void {
		this.formNickname = this.settingsPreference.userInfo.nickname;
		this.formEmail = this.settingsPreference.userInfo.email;
		this.formFactor = this.settingsPreference.userInfo.factor_enabled;
  	}
	editAvatar(file: any)
	{
		this.file = file.target.files[0];
		if (this.file && this.file.size < 2000000)
		{
			this.onUploadAvatar(this.file);
			this.showMsg("Avatar successfuly changed", false);
		}
		else
			this.showMsg("Image to large! Max size 2 MB", true);
	}
	async showQr(){
		const resp = await this.settingService.sendCode(this.session);
		if (resp.statusCode != 200)
			this.showMsg(resp.data.error, true);
		else
		{
			this.qrButtonValue = "Resend Code";
			this.showMsg("Code has been sended to your email!", false)
			this.showCodeInput = true;
		}
	}
	async validate(value: any){
		const resp = await this.settingService.showQrCode(this.session, value.code);
		if (resp.statusCode != 200)
			this.showMsg(resp.data.error, true);
		else
		{
			this.qrButtonValue = "Show QR";
			this.qrUrl = resp.data.qr;
			this.showQrImg = true;
			this.showCodeInput = false;
		}

	}
	async onSubmitSettings(value: any)
	{
		const nickname = this.settingsPreference.userInfo.nickname;
		const email = this.settingsPreference.userInfo.email;
		const factor = this.settingsPreference.userInfo.factor_enabled;
		this.settingsPreference.userInfo.email = value.email;
		this.settingsPreference.userInfo.nickname = value.nickname;
		this.settingsPreference.userInfo.factor_enabled = value.factor;
		const result = await this.settingService.updateUser(this.settingsPreference.userInfo, this.session);
		if (result.statusCode == 200)
		{
			if (result.statusCode == 200)
			{
				this.settingsPreference.userInfo = result.data;
				this.showMsg("User setting successfuly updated!", false);
			}
		}
		else if (result.statusCode === 410)
		{
			this.sQuery.removeAll();
			this.router.navigateByUrl('logIn');
		}
		else
		{
			this.settingsPreference.userInfo.nickname = this.formNickname = nickname;
			this.settingsPreference.userInfo.email = this.formEmail = email;
			this.settingsPreference.userInfo.factor_enabled = this.formFactor = factor;
			this.showMsg("Email or username not availible!", true);
		}
	}
	async onUploadAvatar(value: any){
		var file = value;
		try {
			const result = await this.settingService.uploadImage(file, this.settingsPreference.userInfo.login, this.session);		
			if (result.statusCode == 200)
				this.settingsPreference.userInfo = result.data;
			else if (result.statusCode === 410)
			{
				this.sQuery.removeAll();
				this.router.navigateByUrl('logIn');
			}
			else
				console.log("error: ", result);
			
		} catch (error) {
			
		}
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.formFactor = true;
		else
			this.formFactor = false;
	}

	async deleteAccount(): Promise<void> {
		if (confirm('Are you sure you want to delete your account? You won\'t get it back!')) {
			const resp = await this.settingService.deleteUserAccount(this.session);
			this.sQuery.removeAll();
			this.router.navigateByUrl('logIn');
		}
		else
			this.showMsgBox = false;

	}
	disableSaveButton(values: any){
		var ret = true;
		if (values.nickname != this.settingsPreference.userInfo.nickname)
			ret = false;
		if (values.email != this.settingsPreference.userInfo.email)
			ret = false;
		if (values.factor != this.settingsPreference.userInfo.factor_enabled)
			ret = false;
		return (ret);
	}
	showMsg(msg: string, isError: boolean)
	{
		this.msgError = isError;
		this.showMsgBox = true;
		this.update_message = msg;
		var  counter = 5 // choose whatever you want
		let intervalId = setInterval(() => {
			counter--;
			if (counter-- == 0)
			{
				this.closeMsg();
				clearInterval(intervalId)
			}
		}, 1000)
	}

	closeMsg(){
		this.showMsgBox = false;
		this.update_message = "";
	}
}
