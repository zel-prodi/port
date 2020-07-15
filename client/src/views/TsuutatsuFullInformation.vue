<template>
    <div>
        <NavBar/>
        <!-- {{fileInfo}} -->
        <v-toolbar dense flat color="blue-grey lighten-5">
            <div>
                <v-toolbar-title>{{fileInfo.document_type}} - {{fileInfo.document_id}}</v-toolbar-title>
            </div>
            <v-divider class="ma-2" vertical inset></v-divider>
            <div>
                <h3 class="caption">File Attachments:</h3>
                <template v-for="(attachment, i) in fileInfo.file_attachments">
                    <v-btn x-small rounded outlined @click="showUploadedFile(attachment)" color="primary" :key="i">{{attachment.filename}}</v-btn>
                </template>
            </div>
            
            <v-spacer></v-spacer>
            <v-btn class="mr-2" @click="$router.push('TsuutatsuConfirmationPage')" small rounded color="primary">{{ $t('Confirmation') }}</v-btn>
            <v-divider inset vertical></v-divider>
            <v-btn @click="$store.commit('FILE_INFO', {}) , $router.push('TsuutatsuPage')" text>{{ $t('Back') }}</v-btn>
        </v-toolbar>
        
        <v-container fluid grid-list-lg
            style="max-height: 510px; max-width:100%; background-color: #90A4AE"
            class="overflow-y-auto">   
                <v-col cols="12" >
                <v-card class="ma-4 pa-5" style="border:1px solid grey">
                    <span v-html="model"></span>
                </v-card>
                
                </v-col>
        </v-container>
    </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
export default {
    components:{
        NavBar
    },
    data(){
        return{
            model:'',
            path:  ``
        }
    },
    methods:{
        showUploadedFile(attachment){
            window.open(attachment.file_path, '_blank');
        },
        showTsuutatsuFullDetails(){
            let item = this.fileInfo
            this.model = `<hr>
                <h1 style="text-align: center;"><strong><span style="font-family: Times New Roman,Times,serif,-webkit-standard;">H.R.D. SINGAPORE PTE LTD&nbsp;</span></strong></h1>
                <hr>
                <p style="text-align: center;">Block 3, Cavite Economic Zone Ⅱ, General Trias, Cavite, Philippines 4107
                <br>Tel : 010-63-2-857-8280 Fax : 010-63-2-857-8286 mailto:<span style="color: rgb(44, 130, 201);"><a href="mailto:
                ${item.person_incharge.map(rec => {
                    return rec.email.toString()
                })}">

                ${item.person_incharge.map(rec => {
                    return rec.email.toString()
                })}</a></span></p>
                <hr>
                <p>
                <br>
                </p>
                <table style="width: 100%;">
                <tbody>
                    <tr>
                    <td style="width: 11.1455%;"><strong><span style='font-family: "Times New Roman", Times, serif, -webkit-standard;'>ＨＲＤ通達:</span></strong></td>
                    <td style="width: 28.8958%;">${item.document_id}</td>
                    <td style="width: 9.5975%;"><strong>発信日:</strong></td>
                    <td style="width: 22.291%;">${item.outgoing_date}</td>
                    </tr>
                </tbody>
                </table>
                <br>
                <p style="text-align: left;"><strong>件名:&nbsp;</strong>${item.subject}</p>
                <p style="text-align: left;"><strong>コンテンツ:&nbsp;</strong></p>
                <p style="text-align: left;">${item.content}</p>
                <p style="text-align: left;">
                <br>
            </p>`
        }
    },
    created(){
        this.showTsuutatsuFullDetails();
        this.$store.commit('TITLE_PAGE', this.$router.currentRoute.name);
        
    }
}
</script>