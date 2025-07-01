import { Request, Response } from 'express';
import { HomeService } from './home.service';
import { GetHomeDataQueryDto } from './dto/get-home-data-query.dto';
import { getResponseAPI } from '../../common/getResponseAPI';

export class HomeController {
  private homeService: HomeService;

  constructor(homeService: HomeService) {
    this.homeService = homeService;
  }

  async getHomeData(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const homeData = await this.homeService.getHomeData(query);

      res.json(getResponseAPI("0", homeData));
    } catch (error: any) {
      res.status(400).json(getResponseAPI("400", { errors: error.message }));
    }
  }

  async getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const products = await this.homeService.getFeaturedProducts(query);

      res.json(getResponseAPI("0", products));
    } catch (error: any) {
      res.status(400).json(getResponseAPI("400", { errors: error.message }));
    }
  }

  async getNewArrivals(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const products = await this.homeService.getNewArrivals(query);

      res.json(getResponseAPI("0", products));
    } catch (error: any) {
      res.status(400).json(getResponseAPI("400", { errors: error.message }));
    }
  }

  async getDeals(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as any;
      const products = await this.homeService.getDeals(query);

      res.json(getResponseAPI("0", products));
    } catch (error: any) {
      res.status(400).json(getResponseAPI("400", { errors: error.message }));
    }
  }
} 