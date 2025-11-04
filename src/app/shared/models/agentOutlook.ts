export class AgentOutlook {
    subject: string;
    body: string;
    isBodyHtml: string;
    recipients: string[];
    attachments:Attachments[];
}

export class Attachments {
    filename: string;
    dataBase64: string;
}


