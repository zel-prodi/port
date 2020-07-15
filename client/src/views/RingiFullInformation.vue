<template>
  <div>
    <NavBar/>

    <v-toolbar dense flat color="blue-grey lighten-5">
      <div>
        <v-toolbar-title>
          <span class="caption">{{ $t('Customer No') }}:</span>
          <span class="caption"> {{fileInfo.document_id}}</span>
        </v-toolbar-title>
      </div>
      <v-divider class="ma-1" vertical inset></v-divider>
      <div >
        <h3 class="overline">File Attachments:</h3>
        <template v-for="(attachment, i) in fileInfo.file_attachments">
          <v-btn v-if="fileInfo.file_attachments.length != 0" x-small @click="showFileAttachment(attachment)" :key="i" rounded outlined color="primary">{{ attachment.filename }}</v-btn>
          <h3 class="caption grey--text" v-else :key="i">No File Attachments</h3>
        </template>
      </div>
        
      <v-spacer></v-spacer>
      <v-btn v-if="fileInfo.document_status === 'For HRD Review' && userInfo.account_type === 'HRD User' " @click="writeComment()"  class="mr-1" rounded small color="primary"><v-icon small class="mr-1">mdi-reply-outline</v-icon>{{ $t('Write A Comment') }}</v-btn>
      <v-btn v-if ="fileInfo.document_status === 'For Revision' && userInfo.account_type === 'HRD Admin'"  @click="reviseRingi()" class="mr-1"   rounded small color="primary"><v-icon small class="mr-1">mdi-file-replace-outline</v-icon>{{ $t('Revise') }}</v-btn>
      <v-btn v-if="fileInfo.document_status === 'For Approval' && userInfo.account_type === 'HRD Admin'" @click="selectRecipientDialog = !selectRecipientDialog" class="mr-1"  rounded small color="primary"><v-icon small class="mr-1">mdi-file-move-outline</v-icon>{{ $t('Distribute') }}</v-btn>
      <v-btn v-if="fileInfo.document_status === 'Revised Ringi' && userInfo.account_type != 'HRD User'"  @click="viewHistory()" class="mr-1"  rounded small color="primary"><v-icon small class="mr-1">mdi-file-clock-outline</v-icon>{{ $t('View History') }}</v-btn>
      <v-divider inset vertical></v-divider>
      <v-btn @click="$store.commit('FILE_INFO', {}) , $router.push('RingiPage')" text>{{ $t('Back') }}</v-btn>
    </v-toolbar>
    <v-divider color="grey"></v-divider>

    <!-- UI OF VIEW RINGI FILE IF THE USER IS HRD ADMIN OR HRD USER -->
    <v-container
      style="max-height: 580px; max-width:100%; background-color:#FAFAFA"
      class="overflow-y-auto"> 
      <v-row :justify="fileInfo.document_status === 'For Approval' && userInfo.account_type === 'GC Leader' ? 'center' : 'start'">
        <v-col :cols="fileInfo.document_status === 'For Approval' && userInfo.account_type === 'GC Leader' ? '10' : '8'">
          <v-card class=" pa-5" style="border:1px solid grey">
            <span v-html="model"></span>
          </v-card> 
        </v-col>

        <v-col cols="4" v-if="userInfo.account_type != 'GC Leader' && fileInfo.document_status === 'For Approval' 
          || fileInfo.document_status === 'For HRD Review' || fileInfo.document_status === 'For Revision' || fileInfo.document_status === 'Revised Ringi' ">

          <v-toolbar dense flat>
            <v-toolbar-title>{{ $t('Comments') }}</v-toolbar-title>
          </v-toolbar>
          <v-divider color="#E3F2FD"></v-divider>

          <v-container
            style="max-height: 520px;"
            class="overflow-y-auto pa-0"> 
            <template v-if="comments.length > 0">
              <v-card class="mt-1 pa-1" v-for="(comment, i) in comments"  :key="i" style="border:1px solid grey; background-color:#E3F2FD">
                <h3 class="caption font-weight-bold ma-3">
                  {{fileInfo.reviewed_by_username}} <br>
                  <h5 class="font-weight-light"><v-icon small>mdi-email</v-icon> {{fileInfo.reviewed_by_email}}</h5>
                </h3>
                <h5 class="font-weight-regular ml-7">
                  {{comment.comment}}
                </h5>
                <span class="overline mt-1"><v-icon small>mdi-calendar</v-icon>{{fileInfo.date_reviewed}}</span>
                <template v-if="userInfo.email === fileInfo.reviewed_by_email">
                  <v-btn @click="editRingiComment(comment)" :disabled="fileInfo.is_reviewed ? true : false" text x-small color="primary"><v-icon x-small>mdi-pencil</v-icon> {{$t('Edit')}}</v-btn>
                  <v-btn @click="deleteRingiComment(comment)" :disabled="fileInfo.is_reviewed ? true : false" text x-small color="red"><v-icon x-small>mdi-trash-can</v-icon> {{ $t('Delete') }}</v-btn>
                </template>
                
              </v-card>
            </template>

            <template v-else>
              <v-card flat color="#FAFAFA">
                  <p class="text-center grey--text">- No Comments Yet. -</p>
              </v-card>
            </template>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <!-- DIALOGS -->  

    <!-- COMMENT TO RINGI DIALOG -->
    <v-dialog v-model="writeCommentDialog" max-width="500" persistent>
      <v-card>
        
      <v-card-title class="headline font-weight-light">{{ $t( formTitle ) }}
          <v-spacer></v-spacer>
          <v-btn icon color="primary" @click="saveComment(), writeCommentDialog = false"><v-icon color="primary">mdi-check-outline</v-icon></v-btn>
          <v-divider vertical></v-divider>
          <v-btn icon @click="writeCommentDialog = false">
            <v-icon color="red">mdi-close-outline</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider class="mr-2 ml-2"></v-divider>

        <v-card-text>
          <v-file-input :disabled="enabledFileAttachment" show-size counter outlined dense class="mt-1" :label="$t('Attachment')" v-model="uploadObject" @change="getFile()"/> 
          <v-textarea class="ma-2" outlined counter hide-details 
            no-resize height="200" v-model="toAdd.comment"
          ></v-textarea>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- SELECT RECIPIENT DIALOG -->
    <v-dialog v-model="selectRecipientDialog" scrollable max-width="800px">
      <v-card>
        <v-card-title>{{ $t('Select Recipient') }}
          <v-spacer></v-spacer>
          
          <v-btn icon @click="selectedRecipient = [], selectRecipientDialog = false">
              <v-icon>mdi-close</v-icon>
          </v-btn>
        
        </v-card-title>
        <v-divider></v-divider>
        <v-text-field single-line append-icon="mdi-magnify" class="ma-2" style="width:50%" outlined dense v-model="recipientToSearch" :label="$t(`Search Recipient's First/Last Name`)"></v-text-field>

        <v-card-text>
          <v-data-table
            v-model="selectedRecipient"
            :headers="recipientHeaders"
            :items="computedHRDUsers"
            :single-select="singleSelect"
            item-key="first_name"
            show-select
            class="elevation-1"
            dense
          >
            <template v-slot:top>
              <v-switch v-model="singleSelect" label="Single select" class="pa-3"></v-switch>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red darken-1" text @click="selectedRecipient = [], selectRecipientDialog = false">
            {{ $t('Cancel') }}
          </v-btn>

          <v-btn color="blue darken-1" text @click="distributeRingi()">
            <v-icon small>mdi-send</v-icon>
            &nbsp;{{ $t('Send') }}
          </v-btn>

        </v-card-actions>
      </v-card>
    </v-dialog>

    
  </div>
</template>

<script>
  import NavBar from '@/components/NavBar.vue';
  import moment from 'moment';
  export default {
    components: {
      NavBar
    },
    data(){
      return{
        model:'',
          HRDuserEmails: [],
        selectRecipientDialog: false,
        recipientHeaders: [
          { text: 'First Name', value: 'first_name' },
          { text: 'Last Name', value: 'last_name'},
          { text: 'Company Group', value: 'company_group'},
          { text: 'Email', value: 'email' },
        ],
        selectedRecipient: [],
        recipientToSearch: '',
        HRDUsers: [],
        singleSelect:true,
        isDisabled: false,
        toUpdate: {},
        writeCommentDialog: false,
        toAdd: {},
        comments: [],
        originalFileModel: ``,
        ress:[],
        formTitle: '',


        ringiFiles: []
      }
    },
    methods:{
      showFileAttachment(attachment){
        window.open(attachment.file_path, '_blank');
      },
      viewHistory(){
        console.log(this.fileInfo)
        this.$router.push('RevisedRingiHistory');
      },
      reviseRingi(){
        this.$router.push('ReviseRingiPage')
      },
      deleteRingiComment(item){
        let conf = confirm('DELETE this comment?');
        if(conf === true){
          this.fileInfo.comments.splice(this.fileInfo.comments.indexOf(item), 1)
          let url = `${this.aws}updateRecord`;
          this.axios.put(url, this.fileInfo).then(() => {
            this.$toast.success(' ','Comment Deleted', this.notificationSystem.options.success)
            
          })
        }
      },
      editRingiComment(item){
        this.toAdd = item
        console.log(item)
        this.writeCommentDialog = true;
        this.formTitle = 'Edit Comment'
      },
      saveComment(){
        if(this.formTitle === 'Write A Comment'){
          this.toUpdate = this.fileInfo;

          this.toUpdate.reviewed_by_email = this.userInfo.email;
          this.toUpdate.reviewed_by_username = this.userInfo.username;
          this.toUpdate.date_reviewed = moment().format('LLL');
          this.toUpdate.is_reviewed = false;

          this.toUpdate.comments.push(this.toAdd);

          let url = `${this.aws}updateRecord`;
          this.axios.put(url, this.toUpdate).then(() => {
            this.$toast.success(' ','Comment Added', this.notificationSystem.options.success)
            this.$store.commit('FILE_INFO', this.fileInfo)
            this.toAdd = {}
            
          })
        }else{
          let url = `${this.aws}updateRecord`;
          this.axios.put(url, this.toUpdate).then(() => {
            this.$toast.success(' ','Comment Saved', this.notificationSystem.options.success)
            this.$store.commit('FILE_INFO', this.fileInfo)
            this.toAdd = {}
            
          })
        }
        
      },
      writeComment(){
        this.toUpdate = this.fileInfo
        this.writeCommentDialog = true;
        this.formTitle = 'Write A Comment';
      },
      loadComments(){
        this.comments = this.fileInfo.comments
      },
      loadHRDUsers(){
        let company_group = 'HRD';
        let url =  `${this.aws}getAllUserByCompanyGroup/${company_group}`;

        this.axios.get(url).then(res => {
          this.HRDUsers = res.data;
          this.HRDadminEmails = res.data.map(rec => {
            return rec.email
          })
        })
    },
    //METHOD FOR UPDATING THE document_status AND ASSIGNING THE EMAIL OPTIONS OF HRD JA's
    distributeRingi(){
      // IF THE RECIPIENTS IS UNDEFINED, THEN IT WILL RETURN AN ERROR MESSAGE. OTHERWISE THE RINGI FILE WILL BE SENT TO HRD JA's.
      // EMAIL NOTIFICATION
      this.emailOptions.recipient = this.selectedRecipient.map(rec=> {
        return rec.email
      }).toString();

      //ASIGNING EMAIL OPTIONS
      // this.emailOptions.sender = this.userInfo.email;
      this.emailOptions.subject = `GC PORTAL NOTIFICATION - ${this.toUpdate.document_type} ${this.toUpdate.document_id}`
      this.emailOptions.body = `
      You have For Review Ringi File Added by ${this.userInfo.email} 
      <br><br> 
        <p><a href=''>GC PORTAL LINK</a></p>
        <b>Thank You.<b/>
      </p>`

      if(this.emailOptions.recipient != undefined){
        let toUpdate = this.fileInfo
        toUpdate.distributed_by = this.userInfo.email;
        toUpdate.date_distributed = moment().format('L');
        toUpdate.document_status = "For HRD Review";
        toUpdate.recipients = this.emailOptions.recipient;
        console.log(this.emailOptions.recipient)
        let url = `${this.aws}updateRecord`;
        this.axios.put(url, toUpdate).then(() => {
          //EMAIL NOTIF
          this.sendEmailNotif()
          this.$toast.success(' ','Ringi File Sent', this.notificationSystem.options.success);
          this.$router.push('RingiPage');
          this.$store.commit('FILE_INFO', this.fileInfo);
          this.selectRecipientDialog = false;
          this.selectedRecipient = [];
        })

      }else{
        this.$toast.error(' ','No Recipient Selected', this.notificationSystem.options.error)
      }
        
    },
    showRingiFullDetails(){
      let item = this.fileInfo
      if(item.document_status === 'Revised Ringi')
      {
        this.model = `<table style="width: 20%; margin-right: calc(84%);">
          <tbody>
            <tr>
              <td style="width: 19%;"><strong><span style="font-size: 22px;">口外厳禁 <br></span></strong></td>
            </tr>
          </tbody>
          </table>
          <p style="text-align: right;">送付日 ${item.date_created}</p>

          <p style="text-align: left;">GC 千葉&nbsp;</p>

          <p style="text-align: left;">&nbsp;浅井様 &nbsp;</p>

          <p style="text-align: center;"><span style="font-size: 18px;">一件審議 回答票&nbsp;</span></p>

          <table style="width: 100%;">
            <tbody>
              <tr>
              <td style="width: 13.5338%;">回答票番号
                  <br>
              </td>
              <td colspan="3" style="width: 86.3722%;">${item.document_id}
                  <br>
              </td>
              </tr>
              <tr>
              <td style="width: 13.5338%;">受付日
                  <br>
              </td>
              <td style="width: 43.2738%;">${item.reception_date}
                  <br>
              </td>
              <td style="width: 12.594%;">代理発信
                  <br>
              </td>
              <td style="width: 30.6391%;">H.R.D.(S) 沖林 聡 test
                  <br>
              </td>
              </tr>
              <tr>
              <td style="width: 13.5338%;">お客様コード
                  <br>
              </td>
              <td colspan="3" style="width: 86.3722%;">${item.customer_code}
                  <br>
              </td>
              </tr>
              <tr>
              <td style="width: 13.5338%;">発信枚数
                  <br>
              </td>
              <td colspan="3" style="width: 86.3722%;">${item.number_of_outgoing_calls}
                  <br>
              </td>
              </tr>
              <tr>
              <td style="width: 13.5338%;">添付資料
                  <br>
              </td>
              <td colspan="3" style="width: 86.3722%;">

                  <p>${item.attachments}</p>
              </td>
              </tr>
            </tbody>
          </table>
          <p>
          <br>
          </p>

          <table style="width: 100%;">
            <tbody>
              <tr>
                <td style="width: 13.6278%;">審議件名
                  <br>
                </td>
                <td style="width: 86.2782%;">${item.subject}
                  <br>
                </td>
              </tr>
              <tr>
                <td colspan="2" style="width: 100.0000%;">
                  ${item.content}
                </td>
              </tr>
            </tbody>
          </table>
          <p> <br> </p>
        `
      }else{
        
        this.model = `
          <p style="text-align: right;">書面作成日 ${item.date_created}</p> 

          <p style="text-align: left; line-height: 1;">HRD&nbsp;&nbsp;稟議書受付&nbsp;&nbsp;担当者様&nbsp;</p>

          <p style="text-align: left; line-height: 1;"><a>rulebook-gc@hrd-s.com</a></p>

          <p style="text-align: center; line-height: 1;">稟 議 書&nbsp;</p>

          <p style="text-align: right;">&nbsp; 経営責任者印</p>

          <p><img src="blob:http://localhost:8080/ccce1444-6e4a-40c7-accf-e2bcb947f24d" style="width: 81px;" class="fr-fic fr-dib fr-fir"></p>

          <table style="width: 100%;">
            <tbody>
              <tr>
                <td style="width: 13.7218%;">会社名
                  <br>
                </td>
                <td style="width: 25.8459%;">&nbsp;${item.company_name}
                  <br>
                </td>
                <td style="width: 11.8273%;">連絡先ＴＥＬ
                  <br>
                </td>
                <td style="width: 50.5639%;">&nbsp;${item.contact_number}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.7218%;">発信担当者名
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.caller_name}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.7218%;">営業担当者名
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.sales_representative}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.7218%;">お客様コード
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.document_id}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.7218%;">お客様名
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.customer_first_name}&nbsp;${item.customer_last_name}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.7218%;">工 法 ・ 家 タ イ プ
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.house_type}</td>
              </tr>
              <tr>
                <td style="width: 13.7347%;">加工依頼・発注日
                  <br>
                </td>
                <td style="width: 25.8459%;">&nbsp;${item.order_date}
                  <br>
                </td>
                <td style="width: 9.7744%;">上棟日
                  <br>
                </td>
                <td style="width: 50.5639%;">&nbsp;${item.upper_building_date}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.6406%;">発信枚数
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.number_of_outgoing_calls}
                  <br>
                </td>
              </tr>
              <tr>
                <td style="width: 13.6406%;">添付資料
                  <br>
                </td>
                <td colspan="3" style="width: 86.1842%;">&nbsp;${item.attachments}
                  <br>
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            <br>
          </p>

          <table style="width: 100%;">
            <tbody>
              <tr>
                <td style="width: 13.7218%;">審議件名
                  <br>
                </td>
                <td style="width: 86.1842%;">&nbsp;${item.subject}</td>
              </tr>
              <tr>
                <td colspan="2" style="width: 100.0000%;">審議内容
                  <br>
                  <br>&nbsp;${item.content}
                  <br>
                </td>
              </tr>
            </tbody>
          </table>
         `
        }
      }
    },
    created(){
      this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name)
      this.showRingiFullDetails();
      this.loadHRDUsers();
      this.loadComments();
    },
    computed:{
      computedHRDUsers(){
        return this.HRDUsers.filter(rec=>{
          return rec.first_name.toLowerCase().includes(this.recipientToSearch.toLowerCase())
        })
      }
    }
  }
</script>