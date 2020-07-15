<template>
    <div>
        <NavBar/>
        <v-toolbar color="blue-grey lighten-5" flat>
            <v-col cols="4">
                <v-toolbar-title class="subtitle-1">{{ $t('List Of Confirmations About') }} {{fileInfo.document_type}} - {{fileInfo.document_id}}</v-toolbar-title>
                <!-- <v-row class="ml-1" justify="start">
                    <span class="caption">All:</span><span class="caption red--text">{{totalConfirmation}}</span><v-spacer></v-spacer>
                    <span class="caption">New:</span><span class="caption red--text">{{totalNew}}</span><v-spacer></v-spacer>
                    <span class="caption">Answered:</span><span class="caption red--text">{{totalAnswered}}</span><v-spacer></v-spacer>
                    <span class="caption">Not Answered:</span><span class="caption red--text">{{totalNotanswered}}</span>
                </v-row> -->
            </v-col>
            
            <v-spacer></v-spacer>

            <v-text-field
                append-icon="mdi-magnify"
                class="mt-3 mr-3"
                outlined dense single-line
                :label="$t('Search Title...')"
                v-model="search"
            ></v-text-field>

            <v-btn v-if="userInfo.company_group === 'GC'" @click="askAQuestion()" class="mr-2 mb-3" small rounded color="primary">
                {{ $t("Ask A Question") }}
            </v-btn>

            <v-divider vertical inset></v-divider>
            
            <v-btn v-if="userInfo.account_type === 'HRD Admin'" @click="$router.push('TsuutatsuPage')" text class="mt-0 mb-3">
                {{ $t('Back') }}
            </v-btn>

            <v-btn v-else @click="$router.push('TsuutatsuFullInformation')" text class="mt-0 mb-3">
                {{ $t('Back') }}
            </v-btn>

            <template v-slot:extension>
                <v-tabs
                    v-model="tab"
                    align-with-title
                    >
                    <v-tabs-slider color="blue-grey"></v-tabs-slider>

                    <v-tab v-for="(item,ia) in items" :key="ia">
                        {{ $t(item) }}  
                        <template v-for="(total,ib) in computedTotalConf" >
                            <div :key="ib">
                                <template v-if="ia === ib">
                                    <span class="body ml-2">{{total}}</span>
                                </template>
                            </div>
                        </template>
                    </v-tab>
                </v-tabs>
            </template>
        </v-toolbar>
        <v-divider></v-divider>

        <v-tabs-items v-model="tab">
            <v-tab-item v-for="item in items" :key="item">
                <v-container fluid style="max-height:430px; background-color:#FAFAFA" class="overflow-y-auto" >
                    <template v-if="item === 'items.All'">
                        <template  v-for="(confirmation, i) in filteredAllConfirmations" >
                            <v-card v-if="userInfo.account_type === 'HRD Admin' || userInfo.account_type === 'HRD User' || confirmation.sender_email === userInfo.email  || confirmation.is_private === false" :key="i" :color="confirmation.is_new ? 'blue lighten-5' : 'white'" class="pa-3 mb-5">
                                <v-row>
                                    <v-hover v-slot:default="{ hover }">
                                        <v-card-title  style="cursor: pointer;" @click="fullConfirmationDetails(confirmation)" :class="hover ? 'black--text' : 'primary--text'">
                                            {{confirmation.title}}
                                        </v-card-title>
                                    </v-hover>
                                </v-row>
                                
                                <v-spacer></v-spacer>
                                <div class="b mr-5 ml-5">
                                <v-card-text class="ma-0 pa-0" v-html="confirmation.question_content"></v-card-text>
                                </div>
                                <v-spacer></v-spacer>
                                <v-divider></v-divider>
                                <v-card-actions>
                                    <v-row>
                                        <v-icon color="grey darken-4" small class="mr-1">mdi-folder-outline</v-icon>
                                        <span class="overline mt-1 mr-3">{{confirmation.category}}</span>
                                    
                                        <v-icon color="grey darken-4" small class="mr-1">mdi-calendar-outline</v-icon>
                                        <span class="overline mt-1 mr-3">{{confirmation.date_asked}}</span>

                                        <v-icon color="grey darken-4" small class="mr-1">mdi-account</v-icon>
                                        <span class="overline mt-1 mr-3">{{confirmation.sender_username}}</span>

                                        <v-icon color="grey darken-4" small class="mr-1">mdi-forum-outline</v-icon>
                                        <v-hover v-slot:default="{ hover }">
                                            <span style="cursor:pointer" :class="hover ? 'primary--text mt-1 overline mr-3' : 'black--text mt-1 overline mr-3'" @click="fullConfirmationDetails(confirmation)">{{confirmation.response.length}} {{ $t('Response') }}</span>
                                        </v-hover>

                                        <template v-if="confirmation.is_private === false">
                                            <v-icon color="grey darken-4" small class="mr-1">mdi-web</v-icon>
                                            <span class="overline mt-1 mr-3">{{ $t('Public') }}</span>
                                        </template>

                                        <template v-else>
                                            <v-icon color="grey darken-4" small class="mr-1">mdi-lock</v-icon>
                                            <span class="overline mt-1 mr-3">{{ $t('Private') }}</span>
                                        </template>

                                        <v-spacer></v-spacer>

                                        <template v-if="userInfo.email === confirmation.sender_email">
                                            <v-btn color="red" x-small text @click="deleteConfirmation(confirmation)"><v-icon small>mdi-trash-can-outline</v-icon>{{ $t('Delete') }}</v-btn>

                                            <v-divider vertical></v-divider>
                                            <v-btn color="primary" @click="editConfirmation(confirmation)" x-small text><v-icon small>mdi-pencil</v-icon>{{ $t('Edit') }}</v-btn>
                                            <v-divider vertical></v-divider>
                                        </template>

                                        <template v-if="userInfo.email === confirmation.sender_email || userInfo.account_type === 'HRD Admin'">
                                            <v-btn color="primary" @click="updatePublicStatus(confirmation)" x-small text v-if="confirmation.is_private === false"><v-icon small>mdi-lock</v-icon> {{ $t('Make This Private') }} </v-btn>
                                            <v-btn color="primary" @click="updatePublicStatus(confirmation)" x-small text v-else><v-icon small>mdi-web</v-icon>{{ $t('Make This Public') }}</v-btn>
                                        </template>

                                    </v-row>
                                </v-card-actions>
                            </v-card>
                        </template>
                    </template>

                    <template v-if="item === 'items.New'">
                        <template v-for="(newConfirmation, i) in filteredNewConfirmations">
                            <v-card flat v-if="userInfo.account_type === 'HRD Admin' || newConfirmation.sender_email === userInfo.email || newConfirmation.is_private === false"  :key="i">
                                <v-card :color="newConfirmation.is_new ? 'blue lighten-5' : 'white'" class="pa-3 mb-5">
                                    <v-row>
                                        <v-hover v-slot:default="{ hover }">
                                            <v-card-title  style="cursor: pointer;" @click="fullConfirmationDetails(newConfirmation)" :class="hover ? 'black--text' : 'primary--text'">
                                                {{newConfirmation.title}}
                                            </v-card-title>
                                        </v-hover>
                                    </v-row> 
                                    
                                    <v-spacer></v-spacer>
                                    <v-card-text v-html="newConfirmation.question_content"></v-card-text>
                                    <v-spacer></v-spacer>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                        <v-row>
                                            <v-icon color="grey darken-4" small class="mr-1">mdi-folder-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{newConfirmation.category}}</span>
                                        
                                            <v-icon color="grey darken-4" small class="mr-1">mdi-calendar-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{newConfirmation.date_asked}}</span>

                                            <v-icon color="grey darken-4" small class="mr-1">mdi-account</v-icon>
                                            <span class="overline mt-1 mr-3">{{newConfirmation.sender_username}}</span>

                                            <v-icon color="grey darken-4" small class="mr-1">mdi-forum-outline</v-icon>
                                            <v-hover v-slot:default="{ hover }">
                                                <span style="cursor:pointer" :class="hover ? 'primary--text mt-1 overline mr-3' : 'black--text mt-1 overline mr-3'" @click="fullConfirmationDetails(newConfirmation)">{{newConfirmation.response.length}} Response</span>
                                            </v-hover>

                                            <template v-if="newConfirmation.is_private === false">
                                                <v-icon color="grey darken-4" small class="mr-1">mdi-web</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Public') }}</span>
                                            </template>

                                            <template v-else>
                                                <v-icon color="grey darken-4" small class="mr-1">mdi-lock</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Private') }}</span>
                                            </template>

                                            <v-spacer></v-spacer>

                                            <template v-if="userInfo.email === newConfirmation.sender_email">
                                                <v-btn color="red" @click="deleteConfirmation(newConfirmation)" x-small text><v-icon small>mdi-trash-can-outline</v-icon>{{ $t('Delete') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                                <v-btn color="primary" @click="editConfirmation(newConfirmation)" x-small text><v-icon small>mdi-pencil</v-icon> {{ $t('Edit') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                            </template>

                                            <template v-if="userInfo.email === newConfirmation.sender_email || userInfo.account_type === 'HRD Admin'">
                                                <v-btn color="primary" @click="updatePublicStatus(newConfirmation)" x-small text v-if="newConfirmation.is_private === false"><v-icon small>mdi-lock</v-icon>{{ $t('Make This Private') }}</v-btn>
                                                <v-btn color="primary" @click="updatePublicStatus(newConfirmation)" x-small text v-else><v-icon small>mdi-web</v-icon>{{ $t('Make This Public') }}</v-btn>
                                            </template>

                                        </v-row>
                                    </v-card-actions>
                                </v-card>
                            </v-card>
                        </template>
                    </template>

                    <template v-if="item === 'items.Answered'">
                        <template v-for="(answeredConfirmation, i) in filteredAnsweredConfirmations">
                            <v-card flat v-if="userInfo.account_type === 'HRD Admin' || answeredConfirmation.sender_email === userInfo.email || answeredConfirmation.is_private === false"  :key="i">
                                <v-card class="pa-3 mb-5">
                                    <v-row>
                                        <v-hover v-slot:default="{ hover }">
                                            <v-card-title  style="cursor: pointer;" @click="fullConfirmationDetails(answeredConfirmation)" :class="hover ? 'black--text' : 'primary--text'">
                                                {{answeredConfirmation.title}}
                                            </v-card-title>
                                        </v-hover>
                                    </v-row>
                                    
                                    <v-spacer></v-spacer>
                                    <v-card-text v-html="answeredConfirmation.question_content"></v-card-text>
                                    <v-spacer></v-spacer>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                        <v-row>
                                            <v-icon color="black" small class="mr-1">mdi-folder-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{answeredConfirmation.category}}</span>
                                        
                                            <v-icon color="black" small class="mr-1">mdi-calendar-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{answeredConfirmation.date_asked}}</span>

                                            <v-icon color="black" small class="mr-1">mdi-account</v-icon>
                                            <span class="overline mt-1 mr-3">{{answeredConfirmation.sender_username}}</span>

                                            <v-icon color="black" small class="mr-1">mdi-forum-outline</v-icon>
                                            <v-hover v-slot:default="{ hover }">
                                                <span style="cursor:pointer" :class="hover ? 'primary--text overline mt-1 mr-3' : 'black--text overline mt-1 mr-3'" @click="fullConfirmationDetails(answeredConfirmation)">{{answeredConfirmation.response.length}} {{ $t('Response') }}</span>
                                            </v-hover>

                                            <template v-if="answeredConfirmation.is_private === false">
                                                <v-icon color="black" small class="mr-1">mdi-web</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Public') }}</span>
                                            </template>

                                            <template v-else>
                                                <v-icon color="black" small class="mr-1">mdi-lock</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Private') }}</span>
                                            </template>

                                            <v-spacer></v-spacer>

                                            <template v-if="userInfo.email === answeredConfirmation.sender_email">
                                                <v-btn color="red" @click="deleteConfirmation(answeredConfirmation)" x-small text><v-icon small>mdi-trash-can-outline</v-icon> {{ $t('Delete') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                                <v-btn color="primary" @click="editConfirmation(answeredConfirmation)" x-small text><v-icon small>mdi-pencil</v-icon> {{ $t('Edit') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                            </template>

                                            <template v-if="userInfo.email === answeredConfirmation.sender_email || userInfo.account_type === 'HRD Admin'">
                                                <v-btn color="primary" @click="updatePublicStatus(answeredConfirmation)" x-small text v-if="answeredConfirmation.is_private === false"><v-icon small>mdi-lock</v-icon>{{ $t('Make This Private') }}</v-btn>
                                                <v-btn color="primary" @click="updatePublicStatus(answeredConfirmation)" x-small text v-else><v-icon small>mdi-web</v-icon>{{ $t('Make This Public') }}</v-btn>
                                            </template>

                                        </v-row>
                                    </v-card-actions>
                                </v-card>
                            </v-card>
                        </template>
                    </template>

                    <template v-if="item === 'items.Not Answered'">
                        <template v-for="(notAnsweredConfirmation, i) in filteredNotAnsweredConfirmations">
                            <v-card flat v-if="userInfo.account_type === 'HRD Admin' || notAnsweredConfirmation.sender_email === userInfo.email || notAnsweredConfirmation.is_private === false" :key="i">
                                <v-card :color="notAnsweredConfirmation.is_new ? 'blue lighten-5' : 'white'" class="pa-3 mb-5">
                                    <v-row>
                                        <v-hover v-slot:default="{ hover }">
                                            <v-card-title  style="cursor: pointer;" @click="fullConfirmationDetails(notAnsweredConfirmation)" :class="hover ? 'black--text' : 'primary--text'">
                                                {{notAnsweredConfirmation.title}}
                                            </v-card-title>
                                        </v-hover>
                                    </v-row>
                                    
                                    <v-spacer></v-spacer>
                                    <v-card-text v-html="notAnsweredConfirmation.question_content"></v-card-text>
                                    <v-spacer></v-spacer>
                                    <v-divider></v-divider>
                                    <v-card-actions>
                                        <v-row>
                                            <v-icon color="black" small class="mr-1">mdi-folder-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{notAnsweredConfirmation.category}}</span>
                                        
                                            <v-icon color="black" small class="mr-1">mdi-calendar-outline</v-icon>
                                            <span class="overline mt-1 mr-3">{{notAnsweredConfirmation.date_asked}}</span>

                                            <v-icon color="black" small class="mr-1">mdi-account</v-icon>
                                            <span class="overline mt-1 mr-3">{{notAnsweredConfirmation.sender_username}}</span>

                                            <v-icon color="black" small class="mr-1">mdi-forum-outline</v-icon>
                                            <v-hover v-slot:default="{ hover }">
                                                <span style="cursor:pointer" :class="hover ? 'primary--text overline mt-1 mr-3' : 'black--text overline mt-1 mr-3'" @click="fullConfirmationDetails(notAnsweredConfirmation)">{{notAnsweredConfirmation.response.length}} {{ $t('Response') }}</span>
                                            </v-hover>

                                            <template v-if="notAnsweredConfirmation.is_private === false">
                                                <v-icon color="black" small class="mr-1">mdi-web</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Public') }}</span>
                                            </template>

                                            <template v-else>
                                                <v-icon color="black" small class="mr-1">mdi-lock</v-icon>
                                                <span class="overline mt-1 mr-3">{{ $t('Private') }}</span>
                                            </template>

                                            <v-spacer></v-spacer>

                                            <template v-if="userInfo.email === notAnsweredConfirmation.sender_email">
                                                <v-btn color="red" @click="deleteConfirmation(notAnsweredConfirmation)" x-small text><v-icon small>mdi-trash-can-outline</v-icon> {{ $t('Delete') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                                <v-btn color="primary" @click="editConfirmation(notAnsweredConfirmation)" x-small text><v-icon small>mdi-pencil</v-icon> {{ $t('Edit') }}</v-btn>
                                                <v-divider vertical></v-divider>
                                            </template>

                                            <template v-if="userInfo.email === notAnsweredConfirmation.sender_email || userInfo.account_type === 'HRD Admin'">
                                                <v-btn color="primary" @click="updatePublicStatus(notAnsweredConfirmation)" x-small text v-if="notAnsweredConfirmation.is_private === false"><v-icon small>mdi-lock</v-icon>{{ $t('Make This Private') }}</v-btn>
                                                <v-btn color="primary" @click="updatePublicStatus(notAnsweredConfirmation)" x-small text v-else><v-icon small>mdi-web</v-icon>{{ $t('Make This Public') }}</v-btn>
                                            </template>

                                        </v-row>
                                    </v-card-actions>
                                </v-card>
                            </v-card>
                        </template>
                    </template>
                    
                </v-container>
            </v-tab-item>
        </v-tabs-items>

        <!-- DIALOGS -->
        <!-- CONFIRMATION BEFORE SENDING CONFIRMATION DIALOG -->
        <v-row justify="center">
            <v-dialog
                v-model="confirmBeforeSavingQuestionDialog"
                persistent :overlay="false"
                max-width="600px"
                transition="dialog-transition"
                >
            <v-card max-width="2000px" style="overflow:hidden">
            <v-card-title primary-title>
                <span class="font-weight-light">{{ $t('Confirmation') }}</span> 
                <v-spacer></v-spacer>
                <v-btn icon @click="confirmBeforeSavingQuestionDialog = false, questionToAdd = {}, questionToAdd.question_content = ''"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>
                <v-divider></v-divider><br>
                <v-card-text>
                <h3 style="color:black">{{ $t('Are you sure you want to send this Confirmation?') }} <br>
                    {{ $t('Did you already check the other related confirmations for the possible Response?') }}</h3> <br>
                    <v-radio-group v-model="confirmationRadio" :mandatory="false">
                    <v-radio color="primary" :label="$t(radioLabelNo)" value="no"></v-radio><br>
                    <v-radio color="primary" :label="$t(radioLabelYes)" value="yes"></v-radio>
                    </v-radio-group>
                    <v-btn @click="submitQuestion()" dark block color="#263238">{{ $t('Proceed') }}</v-btn>
                </v-card-text>
            </v-card>
            </v-dialog>
        </v-row>

        <!-- ADD QUESTION DIALOG -->
        <v-row justify="center">
            <v-dialog
                v-model="addQuestionDialog"
                persistent max-width="1000">
                <v-card>
                    <v-card-title primary-title>
                        <span class="font-weight-light">{{ $t(questionFormTitle) }}</span> 
                        <v-spacer></v-spacer>
                        <v-btn @click="confirmBeforeSavingQuestion()" rounded small color="primary" class="mr-2"><v-icon small class="mr-1">mdi-send</v-icon>{{ $t('Submit') }}</v-btn>&nbsp;
                        <v-divider vertical></v-divider>
                        <v-btn icon @click="addQuestionDialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </v-card-title>

                    <v-divider class="ml-3 mr-3"></v-divider>               

                    <v-card-text>
                        <v-row>
                            <span class="font-weight-light subtitle">{{ $t('*Empty fields are prohibited.Use (-) instead.') }}</span>
                            <v-spacer></v-spacer>
                            <v-checkbox class="mr-3 font-weight-light caption" color="primary" :label="$t('Make This Private')" v-model="questionToAdd.is_private"></v-checkbox>
                            <v-checkbox class="font-weight-light caption" color="primary" :label="$t('Notify Me Via E-mail')" v-model="notifyMe"></v-checkbox> 
                        </v-row>

                        <v-row justify="end">
                            <v-col cols="5">
                                <v-text-field
                                    v-if="notifyMe === true"
                                    clearable
                                    dense
                                    :label="$t('Email For Notification')"
                                    outlined
                                    v-model="questionToAdd.email_for_notification"
                                ></v-text-field>
                            </v-col> 

                            <v-col cols="4">
                                <v-select
                                    dense
                                    :label="$t('Select Category')"
                                    outlined
                                    :items="confirmationCategory"
                                    v-model="questionToAdd.category"
                                    @change="setPersonInchargeEmail()"
                                ></v-select>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-text-field
                                dense
                                :label="$t('*descriptive title for your question')"
                                outlined
                                v-model="questionToAdd.title"
                            ></v-text-field>
                            <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" label="File Attachment" v-model="uploadObject" @change="getFile()"/> 
                        </v-row>
                        <vue-editor id="editorHeight" v-model="questionToAdd.question_content"/>

                    </v-card-text>
                </v-card>
            </v-dialog>
        </v-row>

    </div>
</template>

<script>
import moment from 'moment';
import NavBar from '@/components/NavBar.vue';
import {VueEditor} from "vue2-editor";

export default {
    components: {
        VueEditor ,
        NavBar
    },
    data(){
        return{
            tab: null,
            items: [
                'items.All', 'items.New', 'items.Answered', 'items.Not Answered',
            ],
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            addQuestionDialog: false,
            questionFormTitle: '',
            questionToAdd: {is_private:false},
            notifyMe: false,            
            newConfirmations: {},
            answeredConfirmations: {},
            notAnsweredConfirmations: {},
            confirmationCategory: [],
            confirmBeforeSavingQuestionDialog: false,
            confirmationRadio: 'no',
            radioLabelNo: `No, Let me check first the other related questions`,
            radioLabelYes: `Yes, but there is no related response for my question`, 
            personInchargeEmail: '',
            search: '',

            confArray: []


        }
    },
    methods:{
        fullConfirmationDetails(item){
            //PASSING THE CONFIRMATIO INFO IN STORE
            this.$store.commit('CONFIRMATION_INFO', item)

            //ASSIGNING THE INDEX OF CONFIRMATION AND PASS IT TO THE STORE
            let index = this.fileInfo.confirmations.indexOf(item)
            this.$store.commit('CONFIRMATION_INDEX', index)

            this.$router.push('TsuutatsuFullConfirmationDetails') 

            //UPDATING THE is_new STATUS ONCE THE CONFIRMATION TITLE IS CLICKED
            if(this.fileInfo.confirmations[index].is_new === true){
                this.questionToAdd = this.fileInfo.confirmations[index]
                this.questionToAdd.is_new = false
                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(res => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    console.log(res.data)
                })
            }
            
        },
        updatePublicStatus(item){
            this.questionToAdd = item;
            console.log(this.questionToAdd)
            if(item.is_private === true){
                console.log(this.questionToAdd.is_private = false)
                this.questionToAdd.is_private = false

                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(() => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.questionToAdd = {is_private:false}
                    this.$toast.success(' ','Status Changed to Public', this.notificationSystem.options.success)
                    this.loadConfirmations();
                })
            }else{
                console.log(this.questionToAdd.is_private = true)
                this.questionToAdd.is_private = true

                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(() => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.questionToAdd = {is_private:false}
                    this.$toast.success(' ','Status Changed to Private', this.notificationSystem.options.success)

                    this.loadConfirmations();
            })
            }
            
        },
        setPersonInchargeEmail(){
            this.personInchargeEmail = this.fileInfo.person_incharge.filter(rec => {
                return rec.category === this.questionToAdd.category
            }).map(rec => {
                return rec.email
            })
        },
        editConfirmation(item){
            this.addQuestionDialog = true
            this.questionFormTitle = 'EDIT CONFIRMATION'
            this.questionToAdd = item

            if(item.email_for_notification){
                this.notifyMe = true
            }else{
                this.notifyMe = false
            }
        },
        deleteConfirmation(item){
            let conf = confirm('DELETE this record?') 
            if(conf === true){
                this.fileInfo.confirmations.splice(this.fileInfo.confirmations.indexOf(item), 1)
                let url = `${this.aws}updateRecord`;
                this.axios.put(url, this.fileInfo).then(() => {
                    this.$toast.success(' ','Record Deleted', this.notificationSystem.options.success)
                    this.$store.commit('FILE_INFO', this.fileInfo)
                })
            }
        },
        confirmBeforeSavingQuestion(){
            if(this.questionFormTitle === 'Ask A Question'){
                this.confirmBeforeSavingQuestionDialog = true
            }else{
                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(res => {
                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.$toast.success(' ',res.data, this.notificationSystem.options.success)
                })
                this.addQuestionDialog = false
                this.questionToAdd = {is_private:false}
            }
        },
        submitQuestion(){
            if(this.confirmationRadio === 'no'){
                this.questionToAdd = {is_private:false} 
                this.questionToAdd.question_content = ''
                this.confirmBeforeSavingQuestionDialog = false
                this.addQuestionDialog = false;
            }else{
                this.questionToAdd.sender_email = this.userInfo.email;
                this.questionToAdd.sender_username = this.userInfo.username;

                this.questionToAdd.file_attachments = [];
                this.questionToAdd.file_attachments.push(this.fileData)

                this.questionToAdd.response = [];
                this.questionToAdd.is_new = true;
                this.questionToAdd.is_answered = false;
                this.questionToAdd.date_asked = moment().format('LLL');
                this.questionToAdd.is_deleted = false;

                this.fileInfo.confirmations.unshift(this.questionToAdd)

                console.log(this.questionToAdd)

                //UPDATING THE fileInfo.confirmations
                let url = `${this.aws}updateRecord`
                this.axios.put(url, this.fileInfo).then(() => {
                    //CALL THE UPLOAD FILE FUNCTION ON myPlugins.js
                    this.uploadFile();

                    this.$store.commit('FILE_INFO', this.fileInfo)
                    this.file = null
                    this.confirmBeforeSavingQuestionDialog = false;
                    this.addQuestionDialog = false;
                    this.questionToAdd = {is_private:false}
                    this.questionToAdd.question_content=''
                    this.confirmationRadio = 'no'
                    this.notifyMe = false

                    // // SENDING EMAIL NOTIFICATION FOR HRD ADMIN AND PERSON IN-CHARGE
                    // //SENDING EMAIL METHOD IS LOCATED ON myPlugins.js INCLUDING emailOptions OBJECT
                    this.emailOptions.recipient = this.fileInfo.sender_email+','+ this.personInchargeEmail.toString()
                    this.emailOptions.subject = `${this.gcPortalSubject} ${this.fileInfo.document_type} ${this.fileInfo.document_id}`
                    // this.emailOptions.body = `<p>You have a new <b>CONFIRMATIONS</b> about <b>${this.fileInfo.document_type} ${this.fileInfo.document_id}</b></p> <br><br> 
                    //     <p>${this.gcPortalLink}</p>`
                    this.emailOptions.body = `
                        You have a new <b>CONFIRMATIONS</b> about <b>${this.fileInfo.document_type} ${this.fileInfo.document_id}</b>
                        <br><br> 
                        <p>Please Check GC Portal System</p>
                        <p>${this.gcPortalLink}</p>
                        <b>Thank You.<b/>
                    </p>`
                    this.sendEmailNotif();
                    this.$toast.success(' ','Confirmation Saved', this.notificationSystem.options.success)

                    this.loadConfirmations();

                })
            }
            
        },
        askAQuestion(){
            this.questionFormTitle = 'Ask A Question'
            this.addQuestionDialog = true;
            console.log(this.fileInfo)

        },
        closeConfirmationPage(){
            this.$router.push('TsuutatsuPage');
            this.$store.commit('FILE_INFO', {})
        },
        test(){
            this.$toast.success('TEST','testing', this.notificationSystem.options.success)
        },
        loadConfirmations(){
           this.newConfirmations = this.fileInfo.confirmations.filter(rec => {
                return rec.is_new === true
            })

            this.answeredConfirmations = this.fileInfo.confirmations.filter(rec => {
                return rec.response.length > 0
            })

            this.notAnsweredConfirmations = this.fileInfo.confirmations.filter(rec => {
                return rec.response.length === 0
            })
        },
        loadConfirmationCategory(){
            this.confirmationCategory = this.fileInfo.person_incharge.map(rec=>{
                return rec.category
            })
        }
    },
    created(){
        this.loadConfirmationCategory()
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        this.loadConfirmations();

        ////SETTING THE TOTAL OF EACH CONFIRMATION CATEGORY
        ////EXAMPLE: ALL:1 NEW:1 ANSWERED:0 NOT-ANSWERED:1
        // this.confArray = []
        // this.confArray = [`${this.filteredAllConfirmations.length}`,`${this.filteredNewConfirmations.length}`,`${this.filteredAnsweredConfirmations.length}`,`${this.filteredNotAnsweredConfirmations.length}`]

      
    },
    computed: {
        computedTotalConf(){
            return [`${this.filteredAllConfirmations.length}`,`${this.filteredNewConfirmations.length}`,`${this.filteredAnsweredConfirmations.length}`,`${this.filteredNotAnsweredConfirmations.length}`]
        },
        filteredAnsweredConfirmations() {
            return this.fileInfo.confirmations.filter(rec => {
                return rec.title.toLowerCase().includes(this.search.toLowerCase()) && rec.is_answered === true
            })
        },
        filteredNewConfirmations() {
            return this.fileInfo.confirmations.filter(rec => {
                return rec.title.toLowerCase().includes(this.search.toLowerCase()) && rec.is_new === true
            })
        },
        filteredAllConfirmations() {
            return this.fileInfo.confirmations.filter(rec => {
                return rec.title.toLowerCase().includes(this.search.toLowerCase())
            })
        },
        filteredNotAnsweredConfirmations() {
            return this.fileInfo.confirmations.filter(rec => {
                return rec.title.toLowerCase().includes(this.search.toLowerCase()) && rec.is_answered === false
            })
        },
    }
}
</script>

<style>
  #editorHeight {
    height: 290px;
  }
  div.b {
  white-space: nowrap; 
  /* width: 500px;  */
  overflow: hidden;
  text-overflow: ellipsis; 
  /* border: 1px solid #000000; */
}
</style>