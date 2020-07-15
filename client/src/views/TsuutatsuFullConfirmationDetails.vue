<template>
    <div>
        <NavBar/>
        <v-toolbar color="blue-grey lighten-5" flat dense >
            <div>
               <v-toolbar-title class="subtitle-1 font-weight-bold">{{fileInfo.document_type}} - {{fileInfo.document_id}}</v-toolbar-title> 
            </div>
            <v-divider class="ma-1" vertical inset></v-divider>
            <div>
                <h3 class="caption font-weight-bold">File Attachments:</h3>
                <template v-for="(attachment, i) in confirmationInfo.file_attachments">
                    <v-btn @click="showFileAttachment(attachment)" rounded outlined x-small color="primary" :key="i">{{ attachment.filename }}</v-btn>
                </template>
            </div>
            

            <v-spacer></v-spacer>

            <v-btn v-if="userInfo.account_type === 'HRD Admin' || userInfo.account_type === 'HRD User'" @click="writeResponse()" class="mr-2 mb-3 mt-2" small rounded color="primary">
                <v-icon small class="mr-1">mdi-lead-pencil</v-icon>{{ $t('Write A Response') }}
            </v-btn>

            <v-divider vertical inset></v-divider>

            <v-btn @click="$router.push('TsuutatsuConfirmationPage')" text class="mt-2 mb-3">
                {{ $t('Back') }}
            </v-btn>
        </v-toolbar>

        <v-container fluid style="max-height:590px; background-color:#B0BEC5" class="overflow-y-auto" >
            <v-card>
                <v-card-title class="primary--text" primary-title> {{confirmationInfo.title}}</v-card-title>
                <v-divider class="ml-5 mr-5"></v-divider>
                <v-card-text v-html="confirmationInfo.question_content"></v-card-text>

                <v-divider class="ml-5 mr-5 mt-5"></v-divider>

                <v-card-actions class="mr-4 ml-4">
                    <v-row>
                        <v-icon small class="mr-1">mdi-folder-outline</v-icon>
                        <span class="overline mt-1 mr-3">{{confirmationInfo.category}}</span>
                    
                        <v-icon small class="mr-1">mdi-calendar-outline</v-icon>
                        <span class="overline mt-1 mr-3">{{confirmationInfo.date_asked}}</span>

                        <v-icon small class="mr-1">mdi-account</v-icon>
                        <span class="overline mt-1 mr-3">{{confirmationInfo.sender_username}}</span>

                        <v-icon small class="mr-1">mdi-forum-outline</v-icon>
                        <span class="overline mt-1 mr-3">{{confirmationInfo.response.length}} {{ $t('Response') }}</span>

                        <template v-if="confirmationInfo.is_private === false">
                            <v-icon small class="mr-1">mdi-web</v-icon>
                            <span class="overline mt-1 mr-3">{{ $t('Public') }}</span>
                        </template>

                        <template v-else>
                            <v-icon small class="mr-1">mdi-lock</v-icon>
                            <span class="overline mt-1 mr-3">{{ $t('Private') }}</span>
                        </template>

                        <v-spacer></v-spacer>

                    </v-row>
                </v-card-actions>
            </v-card>
            
            <v-card  class="mt-5 pa-1" outline color="blue-grey lighten-4">
                <v-card-title class="blue-grey--text ma-0 pa-3" primary-title>
                    {{ $t('Response') }} ( {{confirmationInfo.response.length}} )
                </v-card-title>
                <v-divider class="mr-3 ml-3"></v-divider>

                <v-card v-for="(confirmationResponse, i) in confirmationInfo.response" :key='i' class="ma-3" outlined>
                    <v-col cols="12">
                        <span class="font-weight-bold">{{confirmationResponse.sender_username}}</span><v-spacer></v-spacer>
                        <v-row class="ml-1 mr-1">
                            <v-icon small class="mr-1">mdi-email-outline</v-icon>
                            <span class="overline mt-1 mr-3">{{confirmationResponse.sender_email}}</span>
                            <v-icon small class="mr-1">mdi-calendar</v-icon>
                            <span class="overline mt-1 mr-3">{{confirmationResponse.date_response}}</span>
                            <v-spacer></v-spacer>
                            <!-- UNCOMMENT IF REPLY FUNCTION IS NEEDED -->
                            <!-- <v-btn @click="writeReply(confirmationResponse)" color="blue-grey" x-small text><v-icon small color="blue-grey">mdi-reply</v-icon>Reply</v-btn> -->
                            <template v-if="userInfo.account_type === 'HRD Admin' || userInfo.account_type === 'HRD User'">
                                <v-btn @click="deleteResponse(confirmationResponse)" color="red" x-small text><v-icon small color="red">mdi-trash-can-outline</v-icon>{{ $t('Delete') }}</v-btn>
                                <v-btn @click="editResponse(confirmationResponse)" color="primary" x-small text><v-icon small color="primary">mdi-pencil-outline</v-icon>{{ $t('Edit') }}</v-btn>
                            </template>
                            

                        </v-row>
                    </v-col>
                    <v-row class="ml-1">
                        <!-- <v-col cols="12">
                            <span class="font-weight-bold caption">{{ $t('Attachments') }}:</span>
                            <template v-for="(attachment, i) in confirmationResponse.file_attachments">
                                <div v-if="confirmationInfo.response.length > 0" :key="i">
                                    <v-btn @click="showFileAttachment(attachment)"  rounded outlined x-small class="ml-2" color="primary">{{ attachment.filename}}</v-btn>
                                </div>

                                <div v-else :key="i+a">
                                    <span class="grey--text"> - No Attachments - </span>

                                </div>
                            </template>
                            
                        </v-col> -->


                        <v-col cols="12">

                            <span class="font-weight-bold caption">{{ $t('Attachments') }}:</span>
                            <template v-for="(attachment, i) in confirmationResponse.file_attachments">
                                <div v-if="confirmationResponse.file_attachments.length === 0" :key="i">
                                    <span>- No Attachments -</span>
                                </div>

                                <div v-else :key="i">
                                    <v-btn  @click="showFileAttachment(attachment)"  rounded outlined x-small class="ml-2" color="primary">{{ attachment.filename}}</v-btn>

                                </div>
                            </template>
                        </v-col>
                    </v-row>

                    <v-card-text v-html="confirmationResponse.response_content"></v-card-text>

                    <!-- UNCOMMENT IF REPLY FUNCTION IS NEEDED -->
                    <!-- <v-divider class="mr-2 ml-2"></v-divider>
                    <span class="font-weight-bold primary--text ma-5">Replies</span>
                    <v-card class="ml-10 mr-10 pl-3 mb-2" outlined v-for="(reply, i) in confirmationResponse.replies" :key="i">
                        <span class="subtitle-2">{{reply.sender_username}}</span><br>
                        <v-row>
                            <v-icon small class="ml-3 mr-1">mdi-calendar</v-icon>
                            <span class="overline mt-1 mr-3">{{reply.date_replied}}</span>
                        </v-row>
                        <v-card-text class="mt-1 pa-0 subtitle-2=" v-html="reply.reply_content"></v-card-text>
                    </v-card> -->
                   
                </v-card>
            </v-card>

        </v-container>


        <!-- DIALOGS -->
        <!-- RESPONSE DIALOG -->
        <v-row justify="center">
            <v-dialog v-model="writeResponseDialog"
                persistent :overlay="false"
                max-width="1000px"
                transition="dialog-transition"
                >
                <v-card>
                    <v-card-title primary-title>
                        <span class="font-weight-light">{{ $t(responseFormTitle) }}</span> 
                        <v-spacer></v-spacer>
                        <v-btn @click="saveResponse()" class="mr-2" rounded small color="primary"><v-icon class="mr-1" small>mdi-send</v-icon>&nbsp;{{ $t('Submit') }} </v-btn>
                        <!-- <v-btn rounded small outlined v-if="questionToAdd.title && questionToAdd.description && formTitle ==='Edit Question'" @click="onEditQuestion()" color="success"><v-icon small>mdi-content-save-outline</v-icon>&nbsp;Save</v-btn>&nbsp; -->
                        <v-divider vertical></v-divider>
                        <v-btn icon @click="writeResponseDialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>

                    <v-divider class="ml-3 mr-3"></v-divider>               

                    <v-card-text>
                        <small>{{ $t('*Empty fields are prohibited.Use (-) instead.') }}</small>
                        <v-row>
                            <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" label="File Attachment" v-model="uploadObject" @change="getFile()"/>
                            <v-col cols="12">
                                *<span>{{ $t('Content') }}</span>
                                <vue-editor id="editorHeight" v-model="responseToAdd.response_content"/>

                            </v-col>
                        </v-row>
                        
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

        <!-- REPLY DIALOG -->
        <v-row justify="center">
            <v-dialog v-model="writeReplyDialog"
                persistent :overlay="false"
                max-width="1000px"
                transition="dialog-transition"
                >
                <v-card>
                    <v-card-title primary-title>
                        <span class="font-weight-light">{{replyFormTitle}}</span> 
                        <v-spacer></v-spacer>
                        <v-btn @click="saveReply()" class="mr-2" rounded small color="primary"><v-icon class="mr-1" small>mdi-send</v-icon>&nbsp;Submit </v-btn>
                        <!-- <v-btn rounded small outlined v-if="questionToAdd.title && questionToAdd.description && formTitle ==='Edit Question'" @click="onEditQuestion()" color="success"><v-icon small>mdi-content-save-outline</v-icon>&nbsp;Save</v-btn>&nbsp; -->
                        <v-divider vertical></v-divider>
                        <v-btn icon @click="writeReplyDialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>

                    <v-divider class="ml-3 mr-3"></v-divider>               

                    <v-card-text>
                        <small>*Empty fields are prohibited.Use (-) instead.</small>
                        <v-row>
                            <v-col cols="12">
                                <span>*Content</span>
                                <vue-editor id="editorHeight" v-model="replyToAdd.reply_content"/>

                            </v-col>
                        </v-row>
                        
                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

        
    </div>
</template>


<script>
import NavBar from '@/components/NavBar.vue';
import {VueEditor} from "vue2-editor";
import moment from 'moment';

export default {
    components: {
        NavBar,
        VueEditor
    },
    data(){
        return{
            confirmationData: [],
            writeResponseDialog: false,
            responseFormTitle: '',
            responseToAdd: {},
            confirmationToUpdate: {},
            writeReplyDialog: false,
            replyFormTitle: '',
            replyToAdd: {},
            replyIndex: -1,
            responseIndex: -1,
        }
    },
    methods:{
        test(){
            alert('test')
        },
        showFileAttachment(attachment){
            window.open(attachment.file_path, '_blank');
        },
        deleteResponse(item){
            this.responseIndex = this.confirmationInfo.response.indexOf(item)
            let conf = confirm('Delete this Response?');
            if(conf === true){
                this.confirmationInfo.response.splice(this.responseIndex, 1)
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, this.fileInfo).then(() => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.$toast.success(' ','Response Deleted', this.notificationSystem.options.success)
                })
            }
        },
        editResponse(item){
            this.responseToAdd = item;
            this.writeResponseDialog = true;
            this.responseFormTitle = 'Edit Response'
            this.responseToAdd.file_attachments.push(this.fileData)
        },
        saveReply(){
            this.replyToAdd.date_replied = moment().format('LLL');
            this.replyToAdd.sender_email = this.userInfo.email;
            this.replyToAdd.sender_username = this.userInfo.username;
            
            this.confirmationInfo.response[this.responseIndex].replies.push(this.replyToAdd)
            let url = `${this.aws}updateRecord`;
            this.axios.put(url, this.fileInfo).then(res => {
                this.$store.commit('FILE_INFO', this.fileInfo)
                this.$toast.success(' ', res.data, this.notificationSystem.options.success)
                this.replyToAdd = {};
                this.writeReplyDialog = false;

                this.emailOptions.recipient = this.confirmationInfo.response[this.responseIndex].sender_email
                this.emailOptions.subject = `GC PORTAL NOTIFICATION - ${this.fileInfo.document_type} ${this.fileInfo.documnet_id}`
                this.emailOptions.body = `<p>${this.userInfo.username} has been replied to your response about <b>${this.fileInfo.document_type} ${this.fileInfo.document_id}</b></p> <br><br> 
                    <a >Visit GC Portal!</a>`
                ////EMAIL FUNCTION
                this.sendEmailNotif()
            })
        },
        writeReply(item){
            this.writeReplyDialog = true;
            this.replyFormTitle = 'Write Reply'
            this.responseIndex = this.confirmationInfo.response.indexOf(item)
        },
        saveResponse(){
            if(this.responseFormTitle === 'Write A Response'){
                this.responseToAdd.sender_email = this.userInfo.email;
                this.responseToAdd.sender_username = this.userInfo.username;
                this.responseToAdd.date_response = moment().format('LLL');

                this.responseToAdd.file_attachments = [];
                this.responseToAdd.file_attachments.push(this.fileData)

                this.responseToAdd.replies = [];

                this.fileInfo.confirmations[this.confirmationIndex].response.push(this.responseToAdd)

                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(res => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    //CALL THE UPLOAD FILE FUNCTION
                    this.uploadFile();
                    
                    
                    this.$toast.success(' ',res.data, this.notificationSystem.options.success)
                    this.responseToAdd = {};
                    this.responseToAdd.file_attachments = []

                    this.writeResponseDialog = false;

                    //SEND EMAIL NOTIFICATION
                    if(this.fileInfo.confirmations[this.confirmationIndex].email_for_notification){
                        this.emailOptions.recipient = this.fileInfo.confirmations[this.confirmationIndex].email_for_notification
                        this.emailOptions.subject = `${this.gcPortalSubject} ${this.fileInfo.document_type} - ${this.fileInfo.document_id}`
                        this.emailOptions.body = `<p>Your Confirmation about <b>${this.fileInfo.document_type} ${this.fileInfo.document_id}</b> has been responsed by ${this.userInfo.email}</p> <br>
                        ${this.gcPortalLink}`

                        ////EMAIL NOTIF
                        this.sendEmailNotif()
                        this.responseToAdd = {};
                        this.writeResponseDialog = false
                    }else{
                        console.log('No Email For Notification')
                    }

                    this.updateConfirmation()
                })
            }else{

                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(res => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.$toast.success(' ',res.data, this.notificationSystem.options.success)
                    this.responseToAdd = {};
                    this.responseToAdd.file_attachments = []
                    this.writeResponseDialog = false;
                })
            }
        },
        updateConfirmation(){
            this.confirmationToUpdate.is_new = false;
            this.confirmationToUpdate.is_answered = true;

            let url = `${this.aws}updateRecord`;
            this.axios.put(url, this.fileInfo).then(res => {
                this.$store.commit('FILE_INFO', this.fileInfo)
                console.log(res.data)
            })
        },
        writeResponse(){
            this.writeResponseDialog = true;
            this.responseFormTitle = 'Write A Response'
        }
    },
    created(){
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.confirmationToUpdate = this.fileInfo.confirmations[this.confirmationIndex]
        
    }
}
</script>

<style>
  #editorHeight {
    height: 250px;
  }
</style>