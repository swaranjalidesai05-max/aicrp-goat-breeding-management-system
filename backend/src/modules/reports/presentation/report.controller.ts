import type { Request, Response } from 'express';

import { reportService } from '../application/report.service';

export class ReportController {
  dashboard = async (_req: Request, res: Response) => {
    const report = await reportService.dashboard();
    res.status(200).json({ data: report });
  };
}

export const reportController = new ReportController();
